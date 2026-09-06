import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import 'package:flutterflow_ai/src/helpers/function_call_helpers.dart'
    show andConditionsVar;
import '../lib/flutterflow_project.dart' as ff;

// Standalone brownfield patch. Do not run the broad dsl/edit.dart for this slice.
void buildReviewReadinessPatch(App app) {
  for (final page in [ff.Pages.signInPage, ff.Pages.customerOnboardingPage]) {
    app.editPageParams(page, (params) {
      params.ensureParam('returnPage', string.withDefault(''));
    });
  }
  app.editPageState(ff.Pages.signInPage, (state) {
    state.ensureField('accountNeedsOnboarding', bool_.withDefault(false));
    state.ensureField('accountEntryFailed', bool_.withDefault(false));
  });
  app.raw((project) => _patchAuthActions(project));
  app.editPage(ff.Pages.signInPage, (page) {
    page.ensureInsertedBefore(
      page.findByKey(
        ff.Pages.signInPage.widgets.all
            .singleWhere((node) => node.name == 'GuestSignInButton')
            .key,
      ),
      Button(
        'Retry account access',
        name: 'RetryAccountAccessButton',
        icon: 'refresh',
        height: 48,
        variant: ButtonVariant.outlined,
        visible: State('accountEntryFailed'),
        onTap: accountEntryActions('retry'),
      ),
    );
  });

  app.editPageState(ff.Pages.savedPage, (state) {
    state.ensureField('savedPlansViewState', string.withDefault('loading'));
    state.ensureField('savedDealsViewState', string.withDefault('loading'));
  });
  app.editPageOnLoad(ff.Pages.savedPage, savedAccountActions('initial'));
  app.editPage(ff.Pages.savedPage, (page) {
    page.ensureActions(
      page.findByText('Refresh saved items'),
      triggerType: FFActionTriggerType.ON_TAP,
      actions: savedAccountActions('refresh'),
    );
    for (final entry in [
      ('SavedPlansList', 'savedPlansViewState', 'plans'),
      ('SavedDealsList', 'savedDealsViewState', 'deals'),
    ]) {
      page.ensureInsertedBefore(
        page.findByKey(
          ff.Pages.savedPage.widgets.all
              .singleWhere((node) => node.name == entry.$1)
              .key,
        ),
        Column(
          name: '${entry.$1}Feedback',
          visible: const Global(GlobalProperty.isUserLoggedIn),
          crossAxis: CrossAxis.start,
          spacing: 8,
          children: [
            Text(
              'Loading saved ${entry.$3}...',
              visible: Equals(State(entry.$2), 'loading'),
              style: Styles.bodyMedium,
            ),
            Text(
              'Saved ${entry.$3} could not be loaded. Refresh to try again.',
              visible: Equals(State(entry.$2), 'error'),
              color: Colors.error,
              style: Styles.bodyMedium,
            ),
          ],
        ),
      );
    }
  });
  app.raw((project) {
    final savedPage = findPage(project, name: ff.Pages.savedPage.name)!;
    for (final name in ['SavedPlansList', 'SavedDealsList']) {
      final list = findDescendants(
        savedPage.node,
        (node) => node.name == name && node.type == FFWidgetType.ListView,
      ).single;
      // The outer page owns scrolling; embedded lists expand with their content.
      list.props.listView.primary = false;
      list.props.listView.scrollPhysics =
          FFScrollPhysics.FF_SCROLL_PHYSICS_NEVER;
    }
    final page = findPage(project, name: ff.Pages.dealsMapPage.name)!;
    final button =
        findDescendants(
          page.node,
          (node) =>
              node.type == FFWidgetType.Button &&
              node.props.button.text.textValue.inputValue == 'View deal',
        ).single;
    // Both checks are native Builder conditions, including before web rollout.
    button.props.ensureVisibility().visibleValue = andConditionsVar([
      for (final condition in [
        Not(Equals(const ItemRef()['referenceId'], '')),
        Not(Equals(const ItemRef()['status'], 'Demo / Not bookable')),
      ])
        compileDslBoolValueForExistingWidgetClass(
          project,
          widgetClassName: page.name,
          targetNodeKey: button.key,
          expression: condition,
        ).variable,
    ]);
  });
}

final _sync = Endpoint.post(
  'SyncMobileAccountV2',
  '/api/account/profile/sync',
  response: ff.Structs.mobileAccountSyncResponseV2,
)..attachToGroup(ff.ApiGroups.goFunMotionAccount);
final _access = Endpoint.get(
  'GetMyAccess',
  '/api/me/access',
  response: ff.Structs.mobileAccessResponse,
)..attachToGroup(ff.ApiGroups.goFunMotionWeb);

List<DslAction> accountEntryActions(String prefix) => [
  SetState('accountEntryFailed', false),
  If(
    const Global(GlobalProperty.isUserLoggedIn),
    then: [
      ApiCall(
        _sync,
        outputAs: '${prefix}AccountSync',
        params: {'token': const AuthUser(AuthUserField.jwtToken)},
        onSuccess:
            (sync) => [
              If(
                Equals(sync['synced'], true),
                then: [
                  SetState('accountNeedsOnboarding', sync['needsOnboarding']),
                  ApiCall(
                    _access,
                    outputAs: '${prefix}AccountAccess',
                    params: {'token': const AuthUser(AuthUserField.jwtToken)},
                    onSuccess: (access) => accountDestinationActions(access),
                    onFailure: _accountFailure(),
                  ),
                ],
                orElse: _accountFailure(),
              ),
            ],
        onFailure: _accountFailure(),
      ),
    ],
  ),
];

List<DslAction> _accountFailure() => [
  SetState('accountEntryFailed', true),
  Snackbar('Account access could not be verified. Retry or continue browsing.'),
];

// Only these two consumer return destinations are accepted. Role destinations
// always come from GetMyAccess, never from a caller-supplied page name or role.
List<DslAction> consumerReturnActions(List<DslAction> fallback) => [
  If(
    Equals(const PageParam('returnPage'), 'previous'),
    then: [const NavigateBack()],
    orElse: [
      If(
        Equals(const PageParam('returnPage'), 'SavedPage'),
        then: [Navigate(ff.Pages.savedPage, allowBack: false)],
        orElse: fallback,
      ),
    ],
  ),
];

List<DslAction> accountDestinationActions(DslExpression access) => [
  If(
    Equals(access['isAdmin'], true),
    then: consumerReturnActions([
      Navigate(ff.Pages.adminPage, allowBack: false),
    ]),
    orElse: [
      If(
        Equals(access['role'], 'business'),
        then: consumerReturnActions([
          If(
            Equals(access['primaryBusinessId'], ''),
            then: [Navigate(ff.Pages.businessOnboardingPage, allowBack: false)],
            orElse: [Navigate(ff.Pages.partnerDashboardPage, allowBack: false)],
          ),
        ]),
        orElse: [
          If(
            Equals(access['role'], 'user'),
            then: [
              If(
                Equals(State('accountNeedsOnboarding'), true),
                then: [
                  // Replace just sign-in so a generated plan/form remains on
                  // the stack until onboarding has saved successfully.
                  Navigate(
                    ff.Pages.customerOnboardingPage,
                    replaceRoute: true,
                    params: {'returnPage': const PageParam('returnPage')},
                  ),
                ],
                orElse: consumerReturnActions([
                  Navigate(ff.Pages.dealsPage, allowBack: false),
                ]),
              ),
            ],
            orElse: _accountFailure(),
          ),
        ],
      ),
    ],
  ),
];

List<DslAction> savedAccountActions(String prefix) => [
  If(
    const Global(GlobalProperty.isUserLoggedIn),
    then: [
      for (final view in [
        'savedPlansViewState',
        'savedDealsViewState',
        'bookingRequestsViewState',
      ])
        SetState(view, 'loading'),
      for (final list in ['savedPlanItems', 'savedDeals', 'bookingRequests'])
        SetState.clear(list),
      ..._savedCollectionSequence(prefix, 0),
    ],
    orElse: [
      for (final list in ['savedPlanItems', 'savedDeals', 'bookingRequests'])
        SetState.clear(list),
      for (final view in [
        'savedPlansViewState',
        'savedDealsViewState',
        'bookingRequestsViewState',
      ])
        SetState(view, 'signedOut'),
    ],
  ),
];

List<DslAction> _savedCollectionSequence(String prefix, int index) {
  final collections = [
    (
      Endpoint.get(
        'GetSavedPlans',
        '/api/me/saved-plans',
        response: ff.Structs.mobileSavedPlansResponse,
      ),
      'savedPlanItems',
      'savedPlans',
      'savedPlansViewState',
    ),
    (
      Endpoint.get(
        'GetSavedListings',
        '/api/me/saved-listings',
        response: ff.Structs.mobileSavedListingsResponse,
      ),
      'savedDeals',
      'savedListings',
      'savedDealsViewState',
    ),
    (
      Endpoint.get(
        'GetMyBookingRequests',
        '/api/me/booking-requests',
        response: ff.Structs.mobileBookingRequestsV2Response,
      ),
      'bookingRequests',
      'bookingRequests',
      'bookingRequestsViewState',
    ),
  ];
  if (index == collections.length) return [];
  final (endpoint, list, field, view) = collections[index];
  // SDK sequential ApiCalls continue only on success. Spell out both branches;
  // branch-specific aliases prevent output collisions in FlutterFlow codegen.
  return [
    ApiCall(
      endpoint..attachToGroup(ff.ApiGroups.goFunMotionWeb),
      outputAs: '$prefix${endpoint.name}',
      params: {'token': const AuthUser(AuthUserField.jwtToken)},
      onSuccess:
          (result) => [
            SetState(list, result[field]),
            SetState(view, 'ready'),
            ..._savedCollectionSequence('${prefix}Success', index + 1),
          ],
      onFailure: [
        SetState.clear(list),
        SetState(view, 'error'),
        ..._savedCollectionSequence('${prefix}Failure', index + 1),
      ],
    ),
  ];
}

Iterable<FFActionNode> reviewActions(FFActionNode node) sync* {
  yield node;
  for (final branch in node.conditionActions.trueActions) {
    yield* reviewActions(branch.trueAction);
  }
  if (node.conditionActions.hasFalseAction()) {
    yield* reviewActions(node.conditionActions.falseAction);
  }
  if (node.hasFollowUpAction()) yield* reviewActions(node.followUpAction);
}

FFActionNode _compile(
  FFProject project,
  FFWidgetClass page,
  FFNode widget,
  List<DslAction> actions, {
  FFActionTriggerType trigger = FFActionTriggerType.ON_TAP,
}) =>
    compileDslActionSequenceForExistingWidgetClass(
      project,
      widgetClassName: page.name,
      targetNodeKey: widget.key,
      triggerType: trigger,
      actions: actions,
    )!;

void _replace(FFActionNode target, FFActionNode replacement) {
  target
    ..clear()
    ..mergeFromMessage(replacement);
}

void _patchAuthActions(FFProject project) {
  final signIn = findPage(project, name: 'SignInPage')!;
  for (final name in [
    'SignInButton',
    'CreateAccountButton',
    'GoogleSignInButton',
    'AppleSignInButton',
  ]) {
    final button =
        findDescendants(signIn.node, (node) => node.name == name).single;
    final trigger = button.triggerActions.singleWhere(
      (trigger) => trigger.trigger.triggerType == FFActionTriggerType.ON_TAP,
    );
    final auth = reviewActions(
      trigger.rootAction,
    ).singleWhere((node) => node.action.hasAuth());
    auth.action.auth.disableAutoNavigate = true;
    // Keep the existing Firebase provider, field bindings and pre-auth actions.
    auth.followUpAction = _compile(
      project,
      signIn,
      button,
      accountEntryActions(name),
    );
  }
  final init = signIn.node.triggerActions.singleWhere(
    (trigger) =>
        trigger.trigger.triggerType == FFActionTriggerType.ON_INIT_STATE,
  );
  init.rootAction = _compile(
    project,
    signIn,
    signIn.node,
    accountEntryActions('existing'),
    trigger: FFActionTriggerType.ON_INIT_STATE,
  );

  for (final name in [
    'FindPlanPage',
    'AiAssistantPage',
    'DealDetailPage',
    'SavedPage',
  ]) {
    final page = findPage(project, name: name)!;
    var count = 0;
    for (final widget in [
      page.node,
      ...findDescendants(page.node, (_) => true),
    ]) {
      for (final trigger in widget.triggerActions) {
        final targets =
            reviewActions(trigger.rootAction)
                .where(
                  (node) =>
                      node.action.hasNavigate() &&
                      node.action.navigate.pageNodeKeyRef.key ==
                          signIn.node.key,
                )
                .toList();
        for (final target in targets) {
          target.action.navigate =
              _compile(project, page, widget, [
                Navigate(
                  ff.Pages.signInPage,
                  params: {
                    'returnPage':
                        name == 'SavedPage' ? 'SavedPage' : 'previous',
                  },
                ),
              ]).action.navigate;
          count++;
        }
      }
    }
    if (count == 0)
      throw StateError(
        'Missing audited sign-in entry on $name. Reinspect before applying.',
      );
  }
  final onboarding = findPage(project, name: 'CustomerOnboardingPage')!;
  final save =
      findDescendants(
        onboarding.node,
        (node) =>
            node.type == FFWidgetType.Button &&
            node.props.button.text.textValue.inputValue == 'Save profile',
      ).single;
  const returnMarker = 'gfmReviewOnboardingReturnV1';
  if (save.triggerActions
      .expand((trigger) => reviewActions(trigger.rootAction))
      .any((node) => node.key == returnMarker))
    return;
  final settings = findPage(project, name: 'AccountSettingsPage')!;
  final returns =
      save.triggerActions
          .expand((trigger) => reviewActions(trigger.rootAction))
          .where(
            (node) =>
                node.action.hasNavigate() &&
                node.action.navigate.pageNodeKeyRef.key == settings.node.key,
          )
          .toList();
  if (returns.length != 1)
    throw StateError('Reinspect onboarding save-success navigation.');
  final returnAction = _compile(
    project,
    onboarding,
    save,
    consumerReturnActions([
      Navigate(ff.Pages.accountSettingsPage, allowBack: false),
    ]),
  );
  returnAction.key = returnMarker;
  _replace(returns.single, returnAction);
}

Future<void> main(List<String> args) async {
  if (!args.contains('--dry-run') && !args.contains('--apply-reviewed-patch')) {
    throw ArgumentError(
      'Use --dry-run for preflight. A reviewed push requires --apply-reviewed-patch.',
    );
  }
  await flutterFlowAI(
    buildReviewReadinessPatch,
    projectId: 'go-fun-motion-deals-vl4mj8',
    dryRun: args.contains('--dry-run'),
    commitMessage:
        'Repair native auth returns, saved loading and map deal guards',
  );
}
