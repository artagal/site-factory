library;

import 'dart:io';

import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/collection_helpers.dart'
    show findCollectionField;
import 'package:flutterflow_ai/src/helpers/data_type_helpers.dart' as ff_types;
import 'package:flutterflow_ai/src/helpers/ensure_helpers.dart'
    show ensureCollectionField;
import 'package:flutterflow_ai/src/helpers/project_helpers.dart'
    show setInitialPage;
import 'package:flutterflow_ai/src/helpers/variable_helpers.dart'
    show varFromAuthUser;

Future<void> main(List<String> args) async {
  final options = _parseCliOptions(args);
  try {
    await flutterFlowAI(
      buildGoFunMotionDealsQueryGuard,
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      projectName: options.projectName,
      projectId: options.projectId,
      findOrCreate: options.findOrCreate,
      allowNewProject: options.allowNewProject,
      dryRun: options.dryRun,
      commitMessage: options.commitMessage,
      validationFilter: _keepValidationError,
    );
  } catch (error) {
    stderr.writeln('Error: ${formatFlutterFlowAIError(error)}');
    exit(1);
  }
}

final class _CliOptions {
  const _CliOptions({
    this.apiKey,
    this.baseUrl,
    this.projectName,
    this.projectId,
    this.findOrCreate = false,
    this.allowNewProject = false,
    this.dryRun = false,
    this.commitMessage,
  });

  final String? apiKey;
  final String? baseUrl;
  final String? projectName;
  final String? projectId;
  final bool findOrCreate;
  final bool allowNewProject;
  final bool dryRun;
  final String? commitMessage;
}

_CliOptions _parseCliOptions(List<String> args) {
  String? apiKey;
  String? baseUrl;
  String? projectName;
  String? projectId;
  String? commitMessage;
  var findOrCreate = false;
  var allowNewProject = false;
  var dryRun = false;

  for (var i = 0; i < args.length; i++) {
    final arg = args[i];
    switch (arg) {
      case '--help':
      case '-h':
        _printUsage();
        exit(0);
      case '--api-key':
        apiKey = _requireValue(args, ++i, '--api-key');
      case '--base-url':
        baseUrl = _requireValue(args, ++i, '--base-url');
      case '--project-name':
        projectName = _requireValue(args, ++i, '--project-name');
      case '--project-id':
        projectId = _requireValue(args, ++i, '--project-id');
      case '--commit-message':
        commitMessage = _requireValue(args, ++i, '--commit-message');
      case '--find-or-create':
        findOrCreate = true;
      case '--allow-new-project':
        allowNewProject = true;
      case '--dry-run':
        dryRun = true;
      default:
        stderr.writeln('Unknown option: $arg');
        _printUsage();
        exit(64);
    }
  }

  return _CliOptions(
    apiKey: apiKey,
    baseUrl: baseUrl,
    projectName: projectName,
    projectId: projectId,
    findOrCreate: findOrCreate,
    allowNewProject: allowNewProject,
    dryRun: dryRun,
    commitMessage: commitMessage,
  );
}

String _requireValue(List<String> args, int index, String flag) {
  if (index >= args.length) {
    stderr.writeln('Missing value for $flag.');
    _printUsage();
    exit(64);
  }
  return args[index];
}

void _printUsage() {
  stdout.writeln('''
Run the GoFunMotion Deals FlutterFlow AI edit flow.

Usage:
  dart run dsl/edit.dart [options]

Options:
  --api-key <key>           FlutterFlow API key. Defaults to FF_API_KEY.
  --base-url <url>          Override the FlutterFlow API base URL.
  --project-name <name>     Create a new project with this name.
  --project-id <id>         Push into an existing project by ID.
  --find-or-create          Retry by reusing a same-name project before creating.
  --allow-new-project       Bypass the workspace binding guard and create a different project.
  --commit-message <text>   Commit message for the push.
  --dry-run                 Compile and validate without pushing.
  --help, -h                Show this help.
''');
}

bool _keepValidationError(error) =>
    !error.message.contains('config file is not uploaded') &&
    !error.message.contains('config files are not uploaded');

void buildGoFunMotionDealsQueryGuard(App app) {
  _ensureAnimatedSplash(app);
  _ensureFirebaseAuth(app);
  _ensureProductionCollectionFields(app);
  _wireProductionQueries(app);
  _removeQueryGuardNotices(app);
  _wireSaferSaveAndBookingActions(app);
}

void _ensureFirebaseAuth(App app) {
  app.ensureFirebaseAuth(
    providers: [
      FirebaseAuthProvider.email,
      FirebaseAuthProvider.google,
      FirebaseAuthProvider.apple,
      FirebaseAuthProvider.anonymous,
    ],
    homePage: 'DiscoverPage',
    signInPage: 'SignInPage',
    autoCreateUserDocument: true,
    userCollectionName: 'users',
  );
}

void _ensureProductionCollectionFields(App app) {
  app.raw((project) {
    for (final field in ['id', 'businessId', 'cityId']) {
      ensureCollectionField(
        project,
        collectionName: 'listings',
        fieldName: field,
        type: ff_types.stringType,
      );
    }
    ensureCollectionField(
      project,
      collectionName: 'listings',
      fieldName: 'ownerIds',
      type: ff_types.listOf(ff_types.stringType),
    );

    for (final field in ['listingId', 'businessId', 'cityId']) {
      ensureCollectionField(
        project,
        collectionName: 'bookingRequests',
        fieldName: field,
        type: ff_types.stringType,
      );
    }
    ensureCollectionField(
      project,
      collectionName: 'bookingRequests',
      fieldName: 'businessOwnerIds',
      type: ff_types.listOf(ff_types.stringType),
    );

    for (final field in ['listingId', 'savedAt']) {
      ensureCollectionField(
        project,
        collectionName: 'savedListings',
        fieldName: field,
        type: field == 'savedAt' ? ff_types.dateTimeType : ff_types.stringType,
      );
    }
    ensureCollectionField(
      project,
      collectionName: 'savedPlans',
      fieldName: 'savedAt',
      type: ff_types.dateTimeType,
    );
  });
}

void _wireProductionQueries(App app) {
  final listings = app.existingCollection('listings');
  final savedListings = app.existingCollection('savedListings');
  final savedPlans = app.existingCollection('savedPlans');

  app.editPageOnLoad('DiscoverPage', [
    FirestoreQuery(listings, limit: 12, outputAs: 'approvedFeaturedDeals'),
    SetState('featuredDeals', const ActionOutput('approvedFeaturedDeals')),
  ]);

  app.editPageOnLoad('DealsPage', [
    FirestoreQuery(listings, limit: 50, outputAs: 'approvedDeals'),
    SetState('deals', const ActionOutput('approvedDeals')),
  ]);

  app.editPageOnLoad('SavedPage', [
    If(
      const Global(GlobalProperty.isUserLoggedIn),
      then: [
        FirestoreQuery(savedPlans, limit: 50, outputAs: 'loadedSavedPlans'),
        SetState('savedPlanItems', const ActionOutput('loadedSavedPlans')),
        FirestoreQuery(savedListings, limit: 50, outputAs: 'loadedSavedDeals'),
        SetState('savedDeals', const ActionOutput('loadedSavedDeals')),
      ],
      orElse: [
        SetState.clear('savedPlanItems'),
        SetState.clear('savedDeals'),
      ],
    ),
  ]);

  app.raw((project) {
    _patchFirestoreQueryAction(
      project,
      pageName: 'DiscoverPage',
      collectionName: 'listings',
      outputVariableName: 'approvedFeaturedDeals',
      filters: const [
        _QueryFilter(fieldName: 'isApproved', staticValue: 'true'),
        _QueryFilter(fieldName: 'status', staticValue: 'approved'),
      ],
      orderByFieldName: 'createdAt',
    );
    _patchFirestoreQueryAction(
      project,
      pageName: 'DealsPage',
      collectionName: 'listings',
      outputVariableName: 'approvedDeals',
      filters: const [
        _QueryFilter(fieldName: 'isApproved', staticValue: 'true'),
        _QueryFilter(fieldName: 'status', staticValue: 'approved'),
      ],
      orderByFieldName: 'createdAt',
    );
    _patchFirestoreQueryAction(
      project,
      pageName: 'SavedPage',
      collectionName: 'savedPlans',
      outputVariableName: 'loadedSavedPlans',
      filters: [
        _QueryFilter(
          fieldName: 'userId',
          variable: varFromAuthUser(FFAuthVariable_AuthProperty.USER_ID),
        ),
      ],
      orderByFieldName: 'createdAt',
    );
    _patchFirestoreQueryAction(
      project,
      pageName: 'SavedPage',
      collectionName: 'savedListings',
      outputVariableName: 'loadedSavedDeals',
      filters: [
        _QueryFilter(
          fieldName: 'userId',
          variable: varFromAuthUser(FFAuthVariable_AuthProperty.USER_ID),
        ),
      ],
      orderByFieldName: 'createdAt',
    );
  });
}

final class _QueryFilter {
  const _QueryFilter({required this.fieldName, this.staticValue, this.variable});

  final String fieldName;
  final String? staticValue;
  final FFVariable? variable;
}

void _patchFirestoreQueryAction(
  FFProject project, {
  required String pageName,
  required String collectionName,
  required String outputVariableName,
  required List<_QueryFilter> filters,
  required String orderByFieldName,
}) {
  final page = findPage(project, name: pageName);
  if (page == null) {
    throw StateError('Page "$pageName" not found.');
  }

  FFAction? action;
  for (final triggerAction in page.node.triggerActions) {
    if (triggerAction.trigger.triggerType != FFActionTriggerType.ON_INIT_STATE ||
        !triggerAction.hasRootAction()) {
      continue;
    }
    action = _findActionByOutputName(
      triggerAction.rootAction,
      outputVariableName,
    );
    if (action != null) break;
  }
  if (action == null) {
    throw StateError(
      'Query action "$outputVariableName" not found on "$pageName".',
    );
  }
  if (!action.hasDatabase() || !action.database.hasFirestoreQuery()) {
    throw StateError(
      'Action "$outputVariableName" on "$pageName" is not a Firestore query.',
    );
  }

  final query = action.database.firestoreQuery;
  query.where = FFFirestoreWhere(
    isAnd: true,
    filters: [
      for (final filter in filters)
        FFFirestoreWhere_NestedFilter(
          baseFilter: _firestoreFilter(
            project,
            collectionName: collectionName,
            fieldName: filter.fieldName,
            staticValue: filter.staticValue,
            variable: filter.variable,
          ),
        ),
    ],
  );
  query.orderBy
    ..clear()
    ..add(
      FFFirestoreOrderBy(
        collectionFieldIdentifier: _fieldIdentifier(
          project,
          collectionName: collectionName,
          fieldName: orderByFieldName,
        ),
        descending: true,
      ),
    );
}

FFAction? _findActionByOutputName(FFActionNode root, String outputVariableName) {
  if (root.hasAction() &&
      root.action.outputVariableName == outputVariableName) {
    return root.action;
  }

  if (root.hasConditionActions()) {
    final condition = root.conditionActions;
    for (final trueAction in condition.trueActions) {
      if (trueAction.hasTrueAction()) {
        final found = _findActionByOutputName(
          trueAction.trueAction,
          outputVariableName,
        );
        if (found != null) return found;
      }
    }
    if (condition.hasFalseAction()) {
      final found = _findActionByOutputName(
        condition.falseAction,
        outputVariableName,
      );
      if (found != null) return found;
    }
  }

  if (root.hasLoopAction() && root.loopAction.hasAction()) {
    final found = _findActionByOutputName(
      root.loopAction.action,
      outputVariableName,
    );
    if (found != null) return found;
  }

  if (root.hasParallelActions()) {
    for (final branch in root.parallelActions.actions) {
      final found = _findActionByOutputName(branch, outputVariableName);
      if (found != null) return found;
    }
  }

  if (root.hasFollowUpAction()) {
    return _findActionByOutputName(root.followUpAction, outputVariableName);
  }

  return null;
}

FFFirestoreFilter _firestoreFilter(
  FFProject project, {
  required String collectionName,
  required String fieldName,
  String? staticValue,
  FFVariable? variable,
}) {
  final filter = FFFirestoreFilter(
    collectionFieldIdentifier: _fieldIdentifier(
      project,
      collectionName: collectionName,
      fieldName: fieldName,
    ),
    relation: FFFirestoreFilter_Relation.EQUAL_TO,
  );
  if (variable != null) {
    filter.variable = variable;
  } else if (staticValue != null) {
    filter.inputValue = FFParameterValue(serializedValue: staticValue);
  } else {
    throw ArgumentError('Filter "$collectionName.$fieldName" has no value.');
  }
  return filter;
}

FFIdentifier _fieldIdentifier(
  FFProject project, {
  required String collectionName,
  required String fieldName,
}) {
  final field = findCollectionField(
    project,
    collectionName: collectionName,
    fieldName: fieldName,
  );
  if (field == null) {
    throw StateError('Field "$collectionName.$fieldName" not found.');
  }
  return field.identifier.deepCopy();
}

void _removeQueryGuardNotices(App app) {
  app.editPage('DiscoverPage', (page) {
    page.ensureRemoved(page.findByName('DiscoverApprovedQueryNotice'));
  });

  app.editPage('DealsPage', (page) {
    page.ensureRemoved(page.findByName('DealsApprovedQueryNotice'));
  });

  app.editPage('SavedPage', (page) {
    page.ensureRemoved(page.findByName('SavedUserScopedQueryNotice'));
  });
}

void _wireSaferSaveAndBookingActions(App app) {
  final listings = app.existingCollection('listings');
  final savedListings = app.existingCollection('savedListings');
  final savedPlans = app.existingCollection('savedPlans');
  final bookingRequests = app.existingCollection('bookingRequests');

  app.editPage('FindPlanPage', (page) {
    page.ensureActions(
      page.findByName('SavePlanButton'),
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        If(
          const Global(GlobalProperty.isUserLoggedIn),
          then: [
            FirestoreCreate(
              savedPlans,
              fields: {
                'userId': const AuthUser(AuthUserField.userId),
                'city': State('city'),
                'persona': State('persona'),
                'when': State('when'),
                'budget': State('budget'),
                'vibe': State('vibe'),
                'summary': State('planSummary'),
                'createdAt': const Global(GlobalProperty.currentTimestamp),
                'savedAt': const Global(GlobalProperty.currentTimestamp),
              },
              outputAs: 'savedPlan',
            ),
            Snackbar('Plan saved.'),
          ],
          orElse: [
            Snackbar('Sign in to save plans.'),
            Navigate('SignInPage'),
          ],
        ),
      ],
    );
  });

  app.editPage('DealDetailPage', (page) {
    page.ensureActions(
      page.findByName('SaveDealButton'),
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        If(
          const Global(GlobalProperty.isUserLoggedIn),
          then: [
            FirestoreCreate(
              savedListings,
              fields: {
                'userId': const AuthUser(AuthUserField.userId),
                'listingRef': PageParam('listingRef'),
                'listingId': State('listing')['id'],
                'listingTitle': State('listing')['title'],
                'city': State('listing')['city'],
                'createdAt': const Global(GlobalProperty.currentTimestamp),
                'savedAt': const Global(GlobalProperty.currentTimestamp),
              },
              outputAs: 'savedDeal',
            ),
            Snackbar('Deal saved.'),
          ],
          orElse: [
            Snackbar('Sign in to save this deal.'),
            Navigate('SignInPage'),
          ],
        ),
      ],
    );

    page.ensureActions(
      page.findByName('SendBookingRequestButton'),
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        If(
          const Global(GlobalProperty.isUserLoggedIn),
          then: [
            FirestoreCreate(
              bookingRequests,
              fields: {
                'userId': const AuthUser(AuthUserField.userId),
                'listingRef': PageParam('listingRef'),
                'listingId': State('listing')['id'],
                'listingTitle': State('listing')['title'],
                'businessId': State('listing')['businessId'],
                'cityId': State('listing')['cityId'],
                'contactName': State('contactName'),
                'contactEmail': State('contactEmail'),
                'partySize': State('partySize'),
                'message': State('message'),
                'status': 'new',
                'createdAt': const Global(GlobalProperty.currentTimestamp),
              },
              outputAs: 'bookingRequest',
            ),
            FirestoreUpdate(
              PageParam('listingRef'),
              collection: listings,
              fields: {
                'updatedAt': const Global(GlobalProperty.currentTimestamp),
              },
            ),
            Snackbar('Booking request sent.'),
          ],
          orElse: [
            Snackbar('Sign in to send booking requests.'),
            Navigate('SignInPage'),
          ],
        ),
      ],
    );
  });
}

void _ensureAnimatedSplash(App app) {
  app.ensurePage(
    'SplashPage',
    route: '/splash',
    description: 'Animated GoFunMotion intro splash using the brand GIF asset.',
    isInitial: true,
    onLoad: [
      const Wait(2300),
      Navigate('DiscoverPage', allowBack: false, replaceRoute: true),
    ],
    body: Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        color: Colors.primaryBackground,
        child: Image(
          'assets/brand/gofunmotion-splash-motion.gif',
          name: 'GoFunMotionAnimatedSplashGif',
          isNetwork: false,
          fit: ImageFit.cover,
          width: double.infinity,
          height: double.infinity,
        ),
      ),
    ),
  );

  app.raw((project) {
    setInitialPage(project, pageName: 'SplashPage');
    final settings = project.ensureAppSettings();
    settings.appIconPath = 'assets/brand/gofunmotion-app-icon-1024.png';
    settings.splashImage = FFSplashImage(
      path: 'assets/brand/gofunmotion-splash.png',
      minSplashScreenDuration: 1500,
      disableForWeb: false,
    );
    settings.downloadUnusedAssets = true;
  });
}
