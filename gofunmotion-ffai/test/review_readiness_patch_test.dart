import 'dart:io';
import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import 'package:test/test.dart';
import '../dsl/review_readiness_patch.dart';
import '../lib/flutterflow_project.dart' as ff;

void main() {
  test('Patch API handles match exported group endpoint identities', () {
    final source =
        File(
          'generated_code/lib/backend/api_requests/api_calls.dart',
        ).readAsStringSync();
    final calls =
        _apiActions([
          ...accountEntryActions('contract'),
          ...savedAccountActions('contract'),
        ]).toList();
    expect(calls.map((call) => call.endpoint.name).toSet(), hasLength(5));
    for (final call in calls) {
      final endpoint = call.endpoint;
      final group = RegExp(
        'class ${endpoint.groupName}Group \\{([\\s\\S]*?)\\n\\}',
      ).firstMatch(source);
      expect(group, isNotNull, reason: endpoint.groupName);
      expect(
        group!.group(1),
        contains('static ${endpoint.name}Call '),
        reason:
            '${endpoint.groupName}.${endpoint.name} must exist in the export',
      );
    }
  });
  test(
    'Brownfield patch compiles twice and preserves unrelated Builder content',
    () {
      final initial = _fixtureProject();
      final manual =
          _widget(initial, 'SavedPage', 'ManualBuilderContent').writeToBuffer();
      final api = initial.backend.apiConfig.writeToBuffer();
      final auth =
          _widget(
            initial,
            'SignInPage',
            'SignInButton',
          ).triggerActions.single.rootAction.action.auth.deepCopy();
      final once =
          compileApp(
            buildApp(buildReviewReadinessPatch),
            project: initial,
          ).project;
      final twice =
          compileApp(
            buildApp(buildReviewReadinessPatch),
            project: once,
          ).project;
      expect(twice.pageKeys.length, initial.pageKeys.length);
      expect(twice.backend.apiConfig.writeToBuffer(), api);
      expect(
        _widget(twice, 'SavedPage', 'ManualBuilderContent').writeToBuffer(),
        manual,
      );
      for (final name in [
        'RetryAccountAccessButton',
        'SavedPlansListFeedback',
        'SavedDealsListFeedback',
      ]) {
        final page =
            name == 'RetryAccountAccessButton' ? 'SignInPage' : 'SavedPage';
        expect(
          findDescendants(
            findPage(twice, name: page)!.node,
            (node) => node.name == name,
          ),
          hasLength(1),
        );
      }
      final updatedAuth =
          _widget(
            twice,
            'SignInPage',
            'SignInButton',
          ).triggerActions.single.rootAction.action.auth;
      auth.disableAutoNavigate = true;
      expect(updatedAuth, auth);
      expect(twice.appState, initial.appState);
      for (final name in ['SavedPlansList', 'SavedDealsList']) {
        final list = _widget(twice, 'SavedPage', name).props.listView;
        expect(list.primary, isFalse);
        expect(list.scrollPhysics, FFScrollPhysics.FF_SCROLL_PHYSICS_NEVER);
      }
      for (final page in [
        'FindPlanPage',
        'AiAssistantPage',
        'DealDetailPage',
        'SavedPage',
      ]) {
        expect(
          _widget(twice, page, 'Entry').toProto3Json().toString(),
          contains('returnPage'),
        );
      }
      final onboarding = _widget(
        twice,
        'CustomerOnboardingPage',
        'SaveProfile',
      );
      final actions = onboarding.triggerActions.expand(
        (t) => reviewActions(t.rootAction),
      );
      expect(
        actions.where((n) => n.action.navigate.isNavigateBack),
        hasLength(1),
      );
      expect(
        actions.where((n) => n.action.database.hasApiCall()),
        hasLength(1),
      );
      final signIn = findPage(twice, name: 'SignInPage')!;
      expect(
        signIn.params.values.where((p) => p.identifier.name == 'returnPage'),
        hasLength(1),
      );
    },
  );

  for (final entry in [
    ('user', false, false, '', '', 'DealsPage'),
    ('business', false, false, 'business-1', '', 'PartnerDashboardPage'),
    ('business', false, true, '', '', 'BusinessOnboardingPage'),
    ('user', true, true, '', '', 'AdminPage'),
    ('user', false, true, '', 'previous', 'CustomerOnboardingPage'),
    ('user', false, false, '', 'previous', 'back'),
    ('business', false, false, 'business-1', 'SavedPage', 'SavedPage'),
    ('user', false, false, '', 'AdminPage', 'DealsPage'),
    ('user', false, false, '', 'https://untrusted.test', 'DealsPage'),
    ('admin', false, false, '', '', null),
    ('unknown', false, false, '', '', null),
  ]) {
    test(
      'Server role ${entry.$1}, admin ${entry.$2}, return ${entry.$5} -> ${entry.$6}',
      () {
        final runtime = _Runtime(
          params: {'returnPage': entry.$5},
          responses: {
            'SyncMobileAccountV2': {
              'synced': true,
              'needsOnboarding': entry.$3,
            },
            'GetMyAccess': {
              'isAdmin': entry.$2,
              'role': entry.$1,
              'primaryBusinessId': entry.$4,
            },
          },
        );
        runtime.run(accountEntryActions('test'));
        expect(runtime.navigation, entry.$6);
        expect(runtime.calls, ['SyncMobileAccountV2', 'GetMyAccess']);
        if (entry.$6 == 'CustomerOnboardingPage') {
          expect(runtime.navigationParams['returnPage'], 'previous');
          expect(runtime.lastNavigate!.replaceRoute, isTrue);
          expect(runtime.lastNavigate!.allowBack, isTrue);
        }
      },
    );
  }
  test(
    'Sync/access failure is retryable and never routes to privileged UI',
    () {
      for (final responses in <Map<String, Map<String, Object?>?>>[
        {'SyncMobileAccountV2': null},
        {
          'SyncMobileAccountV2': {'synced': false},
        },
        {
          'SyncMobileAccountV2': {'synced': true},
          'GetMyAccess': null,
        },
      ]) {
        final runtime = _Runtime(responses: responses);
        runtime.run(accountEntryActions('failure'));
        expect(runtime.navigation, isNull);
        expect(runtime.state['accountEntryFailed'], true);
      }
    },
  );
  test(
    'Successful onboarding returns to the draft without re-saving/rebooking',
    () {
      final runtime = _Runtime(params: {'returnPage': 'previous'});
      runtime.run(consumerReturnActions([Navigate('AccountSettingsPage')]));
      expect(runtime.navigation, 'back');
      expect(runtime.calls, isEmpty);
    },
  );
  for (var failures = 0; failures < 8; failures++) {
    test('Independent saved collection outcomes, failure mask $failures', () {
      final calls = [
        'GetSavedPlans',
        'GetSavedListings',
        'GetMyBookingRequests',
      ];
      final fields = ['savedPlans', 'savedListings', 'bookingRequests'];
      final lists = ['savedPlanItems', 'savedDeals', 'bookingRequests'];
      final views = [
        'savedPlansViewState',
        'savedDealsViewState',
        'bookingRequestsViewState',
      ];
      final runtime = _Runtime(
        responses: {
          for (var i = 0; i < 3; i++)
            calls[i]:
                (failures & (1 << i)) != 0
                    ? null
                    : {
                      fields[i]: [
                        {'id': 'fresh-$i'},
                      ],
                    },
        },
      );
      for (final list in lists) {
        runtime.state[list] = [
          {'id': 'stale-other-account'},
        ];
      }
      runtime.run(savedAccountActions('test'));
      expect(runtime.calls, calls);
      for (var i = 0; i < 3; i++) {
        final failed = (failures & (1 << i)) != 0;
        expect(runtime.state[views[i]], failed ? 'error' : 'ready');
        expect(
          runtime.state[lists[i]],
          failed
              ? []
              : [
                {'id': 'fresh-$i'},
              ],
        );
      }
    });
  }
  test(
    'Compiled load and refresh reach all requests on every outcome path',
    () {
      final project =
          compileApp(
            buildApp(buildReviewReadinessPatch),
            project: _fixtureProject(),
          ).project;
      final saved = findPage(project, name: 'SavedPage')!;
      final refresh =
          findDescendants(
            saved.node,
            (node) =>
                node.props.button.text.textValue.inputValue ==
                'Refresh saved items',
          ).single;
      for (final root in [saved.node, refresh]) {
        final graph = root.triggerActions.single.rootAction;
        final paths =
            _compiledPaths(graph)
                .where(
                  (path) => path.any((action) => action.database.hasApiCall()),
                )
                .toList();
        expect(
          paths,
          hasLength(8),
          reason: '${root.name}: all API outcome combinations',
        );
        final finalStates = <String>{};
        for (final path in paths) {
          expect(
            path
                .where((action) => action.database.hasApiCall())
                .map(
                  (action) => action.database.apiCall.endpointIdentifier.name,
                ),
            ['GetSavedPlans', 'GetSavedListings', 'GetMyBookingRequests'],
          );
          final states = <String, String>{};
          for (final action in path) {
            for (final update in action.localStateUpdate.updates) {
              if (update.hasSetValue() && update.setValue.hasInputValue()) {
                states[update.fieldIdentifier.name] =
                    update.setValue.inputValue.serializedValue;
              }
            }
          }
          final outcomes = [
            for (final field in [
              'savedPlansViewState',
              'savedDealsViewState',
              'bookingRequestsViewState',
            ])
              states[field],
          ];
          expect(outcomes, everyElement(isIn(['ready', 'error'])));
          finalStates.add(outcomes.join(','));
        }
        expect(finalStates, hasLength(8));
        final outputs =
            reviewActions(graph)
                .where((node) => node.action.database.hasApiCall())
                .map((node) => node.action.outputVariableName)
                .toList();
        expect(
          outputs.toSet(),
          hasLength(outputs.length),
          reason: 'Unique branch output aliases',
        );
      }
    },
  );
  test(
    'Signed-out saved refresh clears data and makes no authenticated calls',
    () {
      final runtime = _Runtime(loggedIn: false);
      runtime.run(savedAccountActions('guest'));
      expect(runtime.calls, isEmpty);
      expect(runtime.state['savedPlanItems'], isEmpty);
      expect(runtime.state['savedDealsViewState'], 'signedOut');
      expect(runtime.state['bookingRequestsViewState'], 'signedOut');
    },
  );
  test(
    'Map guard compiles as native item visibility without removing directions',
    () {
      final project =
          compileApp(
            buildApp(buildReviewReadinessPatch),
            project: _fixtureProject(),
          ).project;
      final button = _widget(project, 'DealsMapPage', 'ViewDeal');
      expect(button.toProto3Json().toString(), contains('referenceId'));
      expect(button.toProto3Json().toString(), contains('visibility'));
      final visibility = button.props.visibility.visibleValue.variable;
      for (final sample in [
        ('listing-1', 'Live', true),
        ('', 'Live', false),
        ('legacy-demo-id', 'Demo / Not bookable', false),
        ('', 'Demo / Not bookable', false),
      ]) {
        expect(
          _mapVariable(visibility, {
            'referenceId': sample.$1,
            'status': sample.$2,
          }),
          sample.$3,
          reason: '${sample.$1} / ${sample.$2}',
        );
      }
      expect(
        _widget(project, 'DealsMapPage', 'Directions').triggerActions,
        isNotEmpty,
      );
      expect(
        _widget(project, 'DealsMapPage', 'ShowMap').triggerActions,
        isNotEmpty,
      );
    },
  );
  test(
    'Website snapshots and native plans use the existing flattened render contract',
    () {
      final server =
          File(
            '../apps/website/src/app/api/me/saved-plans/route.ts',
          ).readAsStringSync();
      expect(server, contains('plan.title || plan.generatedTitle'));
      expect(server, contains('plan.summary || plan.generatedSummary'));
      expect(server, contains('input.city || plan.city'));
      final runtime =
          File(
            'generated_code/lib/pages/saved_page/saved_page_widget.dart',
          ).readAsStringSync();
      for (final field in ['title', 'summary', 'city']) {
        expect(runtime, contains('savedPlanItemItem.$field'));
      }
      final saved = _Runtime(
        responses: {
          'GetSavedPlans': {
            'savedPlans': [
              {
                'id': 'web-plan',
                'title': 'Website generated title',
                'summary': 'Web summary',
                'city': 'Chicago',
                'planSnapshot': {
                  'generatedTitle': 'Website generated title',
                  'generatedSummary': 'Web summary',
                },
              },
              {
                'id': 'native-plan',
                'title': 'Native title',
                'summary': 'Native summary',
                'city': 'Austin',
              },
            ],
          },
        },
      );
      saved.run(savedAccountActions('shapes'));
      expect((saved.state['savedPlanItems'] as List).map((p) => p['title']), [
        'Website generated title',
        'Native title',
      ]);
      expect(saved.state['savedPlansViewState'], 'ready');
    },
  );
}

Iterable<ApiCall> _apiActions(List<DslAction> actions) sync* {
  for (final action in actions) {
    if (action is ApiCall) {
      yield action;
      yield* _apiActions(action.buildSuccessActions());
      yield* _apiActions(action.onFailure);
    } else if (action is If) {
      yield* _apiActions(action.thenActions);
      yield* _apiActions(action.elseActions);
    }
  }
}

// Enumerate the compiled proto, not the DSL interpreter: SDK continuation
// behavior can differ from a sequential list of authoring actions.
List<List<FFAction>> _compiledPaths(FFActionNode node) {
  final own = node.hasAction() ? [node.action] : <FFAction>[];
  final branches =
      node.hasConditionActions()
          ? [
            for (final branch in node.conditionActions.trueActions)
              ..._compiledPaths(branch.trueAction),
            if (node.conditionActions.hasFalseAction())
              ..._compiledPaths(node.conditionActions.falseAction)
            else
              <FFAction>[],
          ]
          : [<FFAction>[]];
  final next =
      node.hasFollowUpAction()
          ? _compiledPaths(node.followUpAction)
          : [<FFAction>[]];
  return [
    for (final branch in branches)
      for (final tail in next) [...own, ...branch, ...tail],
  ];
}

Object? _mapVariable(FFVariable variable, Map<String, String> item) {
  Object? result;
  if (variable.source == FFVariableSource.GENERATOR_VARIABLE) {
    result = item;
  } else if (variable.source == FFVariableSource.FUNCTION_CALL) {
    final fn = variable.functionCall;
    final values =
        fn.values
            .map(
              (value) =>
                  value.hasVariable()
                      ? _mapVariable(value.variable, item)
                      : value.inputValue.serializedValue,
            )
            .toList();
    if (fn.hasCombineConditions()) {
      expect(
        fn.combineConditions.operator,
        FFCombineConditions_LogicalOperator.AND_OP,
      );
      result = values.every((value) => value == true);
    } else {
      expect(fn.condition.relation, FFCondition_Relation.EQUAL_TO);
      result = values[0] == values[1];
    }
  } else {
    throw StateError('Unexpected map binding ${variable.source}');
  }
  for (final op in variable.operations) {
    if (op.hasAccessDataStructField()) {
      result =
          (result as Map)[op.accessDataStructField.fieldIdentifier.name] ?? '';
    } else if (op.hasNegate()) {
      result = result != true;
    } else {
      throw StateError('Unexpected map operation $op');
    }
  }
  return result;
}

FFNode _widget(FFProject project, String page, String name) =>
    findDescendants(
      findPage(project, name: page)!.node,
      (node) => node.name == name,
    ).single;

FFProject _fixtureProject() {
  final project = compileApp(buildApp(_fixture)).project;
  final keys = <String, String>{};
  for (final entry in [
    (ff.Pages.signInPage, 'GuestSignInButton'),
    (ff.Pages.savedPage, 'SavedPlansList'),
    (ff.Pages.savedPage, 'SavedDealsList'),
  ]) {
    keys[_widget(project, entry.$1.name, entry.$2).key] =
        entry.$1.widgets.all.singleWhere((node) => node.name == entry.$2).key;
  }
  Object? rekey(Object? value) => switch (value) {
    String() => keys[value] ?? value,
    List() => value.map(rekey).toList(),
    Map() => value.map((key, value) => MapEntry(key, rekey(value))),
    _ => value,
  };
  return FFProject()..mergeFromProto3Json(rekey(project.toProto3Json()));
}

void _fixture(App app) {
  final plan = app.struct('MobileSavedPlanItem', {
    'city': string,
    'id': string,
    'persona': string,
    'planId': string,
    'summary': string,
    'title': string,
  });
  final deal = app.struct('MobileSavedListingItem', {
    'city': string,
    'id': string,
    'listingId': string,
    'listingTitle': string,
  });
  final request = app.struct('MobileBookingRequest', {
    'businessName': string,
    'id': string,
    'listingTitle': string,
    'requestedDate': string,
    'requestedTime': string,
    'status': string,
  });
  final sync = app.struct('MobileAccountSyncResponseV2', {
    'synced': bool_,
    'role': string,
    'needsOnboarding': bool_,
  });
  final access = app.struct('MobileAccessResponse', {
    'isAdmin': bool_,
    'role': string,
    'primaryBusinessId': string,
  });
  final plans = app.struct('MobileSavedPlansResponse', {
    'savedPlans': listOf(plan),
  });
  final deals = app.struct('MobileSavedListingsResponse', {
    'savedListings': listOf(deal),
  });
  final requests = app.struct('MobileBookingRequestsV2Response', {
    'bookingRequests': listOf(request),
    'count': int_,
  });
  final write = app.struct('ReviewFixtureWrite', {'saved': bool_});
  final save = Endpoint.post('SaveProfileFixture', '/profile', response: write);
  app.apiGroup(
    'GoFunMotionAccount',
    baseUrl: 'https://gofunmotion.com',
    endpoints: [
      Endpoint.post(
        'SyncMobileAccountV2',
        '/api/account/profile/sync',
        variables: {'token': string},
        response: sync,
      ),
    ],
  );
  app.apiGroup(
    'GoFunMotionWeb',
    baseUrl: 'https://gofunmotion.com',
    endpoints: [
      Endpoint.get(
        'GetMyAccess',
        '/api/me/access',
        variables: {'token': string},
        response: access,
      ),
      Endpoint.get(
        'GetSavedPlans',
        '/api/me/saved-plans',
        variables: {'token': string},
        response: plans,
      ),
      Endpoint.get(
        'GetSavedListings',
        '/api/me/saved-listings',
        variables: {'token': string},
        response: deals,
      ),
      Endpoint.get(
        'GetMyBookingRequests',
        '/api/me/booking-requests',
        variables: {'token': string},
        response: requests,
      ),
      save,
    ],
  );
  for (final name in [
    'DealsPage',
    'ProfilePage',
    'AdminPage',
    'PartnerDashboardPage',
    'BusinessOnboardingPage',
    'AccountSettingsPage',
  ]) {
    app.page(name, route: '/$name', body: Scaffold(body: Text(name)));
  }
  app.page(
    'SignInPage',
    route: '/sign-in',
    onLoad: [
      If(
        const Global(GlobalProperty.isUserLoggedIn),
        then: [Navigate('ProfilePage')],
      ),
    ],
    body: Scaffold(
      body: Column(
        children: [
          TextField(name: 'EmailField'),
          TextField(name: 'PasswordField'),
          for (final name in [
            'SignInButton',
            'CreateAccountButton',
            'GoogleSignInButton',
            'AppleSignInButton',
          ])
            Button(
              name,
              name: name,
              onTap: [
                LoginEmailPassword(
                  WidgetState('EmailField', WidgetStateProperty.text),
                  WidgetState('PasswordField', WidgetStateProperty.text),
                ),
                Navigate('ProfilePage'),
              ],
            ),
          Button(
            'Browse',
            name: 'GuestSignInButton',
            onTap: Navigate('DealsPage'),
          ),
        ],
      ),
    ),
  );
  app.firebaseAuth(
    providers: [FirebaseAuthProvider.email],
    homePage: 'DealsPage',
    signInPage: 'SignInPage',
  );
  for (final name in ['FindPlanPage', 'AiAssistantPage', 'DealDetailPage']) {
    app.page(
      name,
      route: '/$name',
      body: Scaffold(
        body: Button('Sign In', name: 'Entry', onTap: Navigate('SignInPage')),
      ),
    );
  }
  app.page(
    'CustomerOnboardingPage',
    route: '/onboarding',
    body: Scaffold(
      body: Button(
        'Save profile',
        name: 'SaveProfile',
        onTap: ApiCall(
          save,
          onSuccess: (_) => [Navigate('AccountSettingsPage')],
        ),
      ),
    ),
  );
  app.page(
    'SavedPage',
    route: '/saved',
    state: {
      'savedPlanItems': listOf(plan),
      'savedDeals': listOf(deal),
      'bookingRequests': listOf(request),
      'bookingRequestsViewState': string.withDefault('loading'),
    },
    body: Scaffold(
      body: Column(
        children: [
          Text('Manual copy', name: 'ManualBuilderContent'),
          Button('Sign In', name: 'Entry', onTap: Navigate('SignInPage')),
          ListView(
            name: 'SavedPlansList',
            source: State('savedPlanItems'),
            shrinkWrap: true,
            itemBuilder: (item) => Text(item['title']),
          ),
          ListView(
            name: 'SavedDealsList',
            source: State('savedDeals'),
            shrinkWrap: true,
            itemBuilder: (item) => Text(item['listingTitle']),
          ),
          Button('Refresh saved items'),
        ],
      ),
    ),
  );
  final mapItem = app.struct('ReviewMapItem', {
    'referenceId': string,
    'status': string,
    'mapUrl': string,
  });
  app.page(
    'DealsMapPage',
    route: '/map',
    state: {'rows': listOf(mapItem), 'mapUrl': string},
    body: Scaffold(
      body: ListView(
        source: State('rows'),
        itemBuilder:
            (item) => Column(
              children: [
                Button(
                  'Show on map',
                  name: 'ShowMap',
                  onTap: SetState('mapUrl', item['mapUrl']),
                ),
                Button(
                  'Directions',
                  name: 'Directions',
                  onTap: LaunchUrl(item['mapUrl']),
                ),
                Button(
                  'View deal',
                  name: 'ViewDeal',
                  onTap: Navigate('DealDetailPage'),
                ),
              ],
            ),
      ),
    ),
  );
}

// Executes the same DSL branches compiled above, using controlled API outcomes.
class _Runtime {
  _Runtime({
    this.loggedIn = true,
    this.params = const {},
    this.responses = const {},
  });
  final bool loggedIn;
  final Map<String, Object?> params;
  final Map<String, Map<String, Object?>?> responses;
  final state = <String, Object?>{};
  final calls = <String>[];
  Map<String, Object?> response = {};
  String? navigation;
  Navigate? lastNavigate;
  Map<String, Object?> navigationParams = {};
  Object? value(DslExpression expression) => switch (expression) {
    Literal() => expression.value,
    State() => state[expression.name],
    PageParam() => params[expression.name] ?? '',
    Global() => loggedIn,
    ApiResponse() => response,
    FieldAccess() => (value(expression.target) as Map)[expression.field],
    Equals() => value(expression.left) == value(expression.right),
    Not() => value(expression.value) != true,
    _ => throw StateError('Unsupported fixture expression $expression'),
  };
  void run(List<DslAction> actions) {
    for (final action in actions) {
      switch (action) {
        case If():
          run(
            value(action.condition) == true
                ? action.thenActions
                : action.elseActions,
          );
        case SetState():
          state[action.field] =
              action.kind == SetStateKind.clear ? [] : value(action.value!);
        case ApiCall():
          calls.add(action.endpoint.name);
          final result = responses[action.endpoint.name];
          if (result == null) {
            run(action.onFailure);
          } else {
            response = result;
            run(action.buildSuccessActions());
          }
        case Navigate():
          navigation = action.page;
          lastNavigate = action;
          navigationParams = action.params.map(
            (key, expression) => MapEntry(key, value(expression)),
          );
        case NavigateBack():
          navigation = 'back';
        case Snackbar():
          break;
        default:
          throw StateError('Unsupported fixture action $action');
      }
    }
  }
}
