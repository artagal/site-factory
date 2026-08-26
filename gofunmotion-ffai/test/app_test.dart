import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import 'package:flutterflow_ai/src/helpers/data_schema_helpers.dart'
    show findDataStruct, findDataStructField;
import 'package:test/test.dart';

import '../dsl/create.dart' as gofunmotion;
import '../dsl/edit.dart' as gofunmotionEdit;
import '../dsl/partner_deal_editor.dart';
import '../dsl/ai_experience.dart' as ai;
import '../dsl/auth_experience.dart' as account;
import '../lib/flutterflow_project.dart' as ff;

void main() {
  test(
    'Native AI pages compile with real result bindings and consent off by default',
    () {
      final app = buildApp((app) {
        gofunmotion.buildGoFunMotionDeals(app);
        final api = ai.declareNativeAiApi(app, ff.Collections.listings);
        ai.ensureNativeAssistantPage(app, api);
        ai.ensureNativeSupportPage(app, api);
      });
      final project = compileApp(app).project;
      final assistant = findPage(project, name: ai.aiAssistantPageName)!;
      final support = findPage(project, name: ai.aiSupportPageName)!;
      expect(
        findDescendants(
          assistant.node,
          (node) => node.name == 'AssistantResultCards',
        ),
        hasLength(1),
      );
      expect(
        findDescendants(
          assistant.node,
          (node) => node.name == 'AssistantOpenDeal',
        ),
        hasLength(1),
      );
      expect(
        findDescendants(
          support.node,
          (node) =>
              node.name == 'AiConsentPanelToggle' &&
              node.type == FFWidgetType.Switch,
        ),
        hasLength(1),
      );
      expect(assistant.toProto3Json().toString(), contains('aiConsent'));
      expect(assistant.toProto3Json().toString(), isNot(contains('sk-')));
      expect(assistant.node.toProto3Json().toString(), contains('planJson'));
      final endpoints =
          project.backend.apiConfig.apiGroups
              .singleWhere(
                (group) => group.identifier.name == 'GoFunMotionAssistant',
              )
              .endpoints;
      for (final name in ['AskGoFunMotion', 'SaveAssistantPlan']) {
        final settings =
            endpoints
                .singleWhere((item) => item.identifier.name == name)
                .endpointSettings;
        expect(settings.escapeVariablesInRequestBody, isTrue);
        expect(settings.encodeBodyUtf8, isTrue);
        expect(settings.decodeUtf8, isTrue);
      }
    },
  );

  test(
    'Native sign-in syncs the canonical profile and browsing creates no guest account',
    () {
      final app = buildApp((app) {
        gofunmotion.buildGoFunMotionDeals(app);
        account.ensureNativeAccountEntry(app);
      });
      final project = compileApp(app).project;
      final signIn = findPage(project, name: 'SignInPage')!;
      expect(project.authentication.firebase.hasCreateUserDocument(), isFalse);
      final guest =
          findDescendants(
            signIn.node,
            (node) => node.name == 'GuestSignInButton',
          ).single;
      final guestActions = guest.toProto3Json().toString();
      expect(guestActions, contains('Browse without an account'));
      expect(guestActions, isNot(contains('firebaseAuth')));
      for (final name in [
        'SignInButton',
        'CreateAccountButton',
        'GoogleSignInButton',
        'AppleSignInButton',
      ]) {
        final button =
            findDescendants(signIn.node, (node) => node.name == name).single;
        expect(button.toProto3Json().toString(), contains('SyncMobileAccount'));
        final actions = button.triggerActions.expand(
          (trigger) => _walkActions(trigger.rootAction),
        );
        expect(
          actions.where((node) => node.action.hasNavigate()),
          hasLength(2),
        );
      }
    },
  );

  test('Editor schema migration preserves existing field identities', () {
    final app = buildApp((app) {
      app.struct('MobilePartnerListingItem', {'id': string, 'price': double_});
      app.struct('MobileWriteResponse', {'listingId': string});
    });
    final project = compileApp(app).project;
    final originalId =
        findDataStructField(
          project,
          structName: 'MobilePartnerListingItem',
          fieldName: 'id',
        )!.identifier.key;
    gofunmotionEdit.migratePartnerEditorResponseFields(project);
    final first =
        findDataStruct(
          project,
          name: 'MobilePartnerListingItem',
        )!.writeToBuffer();
    gofunmotionEdit.migratePartnerEditorResponseFields(project);
    expect(
      findDataStructField(
        project,
        structName: 'MobilePartnerListingItem',
        fieldName: 'id',
      )!.identifier.key,
      originalId,
    );
    expect(
      findDataStruct(
        project,
        name: 'MobilePartnerListingItem',
      )!.writeToBuffer(),
      first,
    );
    expect(
      findDataStructField(
        project,
        structName: 'MobileWriteResponse',
        fieldName: 'error',
      ),
      isNotNull,
    );
  });

  test('GoFunMotion bound-project edit flow can be declared', () {
    expect(
      () => buildApp(gofunmotionEdit.buildGoFunMotionDealsQueryGuard),
      returnsNormally,
    );
  });

  test('Partner screen guard rejects duplicate workflow panels', () {
    final app = buildApp((app) {
      app.page(
        'PartnerDashboardPage',
        route: '/partner/dashboard',
        body: Scaffold(
          body: Column(
            children: [
              Container(name: 'PartnerListingsPanel'),
              Container(name: 'PartnerBookingInboxPanel'),
              Button('Create', name: 'CreateLastMinuteDealButton'),
              Button('Refresh', name: 'RefreshPartnerListingsButton'),
            ],
          ),
        ),
      );
    });
    final project = compileApp(app).project;
    gofunmotionEdit.verifyPartnerDealScreenStructure(project);
    final dashboard = findPage(project, name: 'PartnerDashboardPage')!;
    final panel =
        findDescendants(
          dashboard.node,
          (node) => node.name == 'PartnerListingsPanel',
        ).single;
    final column =
        findDescendants(
          dashboard.node,
          (node) => node.type == FFWidgetType.Column,
        ).single;
    column.children.add(panel.deepCopy());
    expect(
      () => gofunmotionEdit.verifyPartnerDealScreenStructure(project),
      throwsStateError,
    );
  });

  test('GoFunMotion Deals DSL app compiles', () {
    final app = buildApp(gofunmotion.buildGoFunMotionDeals);
    final project = compileApp(app).project;

    final discoverPage = findPage(project, name: 'DiscoverPage');
    final findPlanPage = findPage(project, name: 'FindPlanPage');
    final dealsPage = findPage(project, name: 'DealsPage');

    expect(discoverPage, isNotNull);
    expect(findPlanPage, isNotNull);
    expect(dealsPage, isNotNull);
    expect(discoverPage!.node.type, FFWidgetType.Scaffold);
  });

  test(
    'Native partner editor compiles with lossless form and date bindings',
    () {
      final app = buildApp((app) {
        final dashboard = app.page(
          'Dashboard',
          route: '/dashboard',
          body: Scaffold(),
        );
        final signIn = app.page('SignIn', route: '/sign-in', body: Scaffold());
        app.firebaseAuth(
          providers: const [FirebaseAuthProvider.email],
          homePage: dashboard,
          signInPage: signIn,
          autoCreateUserDocument: false,
        );
        final response = app.struct('EditorTestResponse', {
          'text': string,
          'listingId': string,
          'error': string,
        });
        final save = Endpoint.post(
          'SaveEditorTest',
          '/save',
          variables: {
            'availableFromMillis': int_,
            'availableUntilMillis': int_,
            'businessId': string,
            'category': string,
            'description': string,
            'listingId': string,
            'originalPrice': string,
            'price': string,
            'remainingSpots': string,
            'saveMode': string,
            'title': string,
            'token': string,
          },
          response: response,
        );
        final copy = Endpoint.post(
          'CopyEditorTest',
          '/copy',
          variables: {
            'businessId': string,
            'category': string,
            'text': string,
            'token': string,
          },
          response: response,
        );
        app.apiGroup(
          'EditorTest',
          baseUrl: 'https://example.test',
          endpoints: [save, copy],
        );
        ensurePartnerDealEditor(
          app,
          saveListing: save,
          improveTitle: copy,
          improveDescription: copy,
          dashboard: dashboard,
          signIn: signIn,
        );
      });
      final project = compileApp(app).project;
      final editor = findPage(project, name: partnerDealEditorName)!;
      final fields = findDescendants(
        editor.node,
        (n) => n.type == FFWidgetType.TextField,
      );
      expect(fields, hasLength(5));
      expect(
        fields.every(
          (field) => field.props.textField.initialText.textValue.hasVariable(),
        ),
        isTrue,
      );
      final serialized = editor.node.toProto3Json().toString();
      expect(serialized, contains('dateTimeToInteger'));
      expect(serialized, contains('MILLISECOND'));
      expect(serialized, contains('dateTimeFormat'));
      expect(serialized, contains('editingListingId'));

      final dateButton =
          findDescendants(
            editor.node,
            (node) => node.name == 'EditorStartDateButton',
          ).single;
      final dateActions =
          dateButton.triggerActions
              .expand((trigger) => _walkActions(trigger.rootAction))
              .toList();
      final picker = dateActions.singleWhere(
        (node) => node.action.hasDatePicker(),
      );
      expect(picker.action.datePicker.useDefaultTheme, isTrue);
      expect(picker.action.datePicker.allowPast, isTrue);
      expect(
        picker
            .action
            .datePicker
            .defaultDateTime
            .variable
            .functionCall
            .conditionalValue
            .ifConditionalValues
            .single
            .value
            .variable
            .functionCall
            .values
            .single
            .variable
            .baseVariable
            .localState
            .fieldIdentifier
            .name,
        'startsAtMillis',
      );
      final update = dateActions
          .expand((node) => node.action.localStateUpdate.updates)
          .singleWhere(
            (update) => update.fieldIdentifier.name == 'startsAtMillis',
          );
      expect(update.setValue.variable.source, FFVariableSource.WIDGET_STATE);
      expect(update.setValue.variable.nodeKeyRef.key, dateButton.key);
      expect(
        update.setValue.variable.baseVariable.widgetState.actionKeyRef.key,
        picker.action.key,
      );
      final guard = dateActions.singleWhere(
        (node) => node.hasConditionActions(),
      );
      expect(
        guard
            .conditionActions
            .trueActions
            .single
            .condition
            .variable
            .functionCall
            .condition
            .relation,
        FFCondition_Relation.EXISTS_AND_NON_EMPTY,
      );
      final dateLabel =
          findDescendants(
            editor.node,
            (node) => node.name == 'EditorStartDateLabel',
          ).single;
      expect(
        dateLabel
            .props
            .text
            .textValue
            .variable
            .functionCall
            .values
            .single
            .variable
            .nodeKeyRef
            .key,
        editor.node.key,
      );

      final rebind = buildApp((app) => app.raw(bindPartnerDealEditorValues));
      final repeated = compileApp(rebind, project: project).project;
      final secondEditor = findPage(repeated, name: partnerDealEditorName)!;
      expect(
        findDescendants(
          secondEditor.node,
          (n) => n.type == FFWidgetType.TextField,
        ),
        hasLength(5),
      );
    },
  );
}

Iterable<FFActionNode> _walkActions(FFActionNode node) sync* {
  yield node;
  for (final branch in node.conditionActions.trueActions) {
    yield* _walkActions(branch.trueAction);
  }
  if (node.conditionActions.hasFalseAction()) {
    yield* _walkActions(node.conditionActions.falseAction);
  }
  if (node.hasFollowUpAction()) yield* _walkActions(node.followUpAction);
}
