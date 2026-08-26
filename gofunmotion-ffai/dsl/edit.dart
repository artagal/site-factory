library;

import 'dart:io';

import 'package:flutterflow_ai/flutterflow_ai.dart';
import '../lib/flutterflow_project.dart' as ff;
import 'package:flutterflow_ai/src/helpers/collection_helpers.dart'
    show findCollectionField;
import 'package:flutterflow_ai/src/helpers/data_schema_helpers.dart'
    show findDataStruct, updateDataStructField;
import 'package:flutterflow_ai/src/helpers/data_type_helpers.dart' as ff_types;
import 'package:flutterflow_ai/src/helpers/ensure_helpers.dart'
    show ensureCollectionField;
import 'package:flutterflow_ai/src/helpers/project_helpers.dart'
    show setInitialPage;
import 'package:flutterflow_ai/src/helpers/theme_helpers.dart'
    show ffThemeColor, getTypographyStyle, setTypographyStyle;
import 'package:flutterflow_ai/src/helpers/variable_helpers.dart'
    show generatorVarField;

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
  _ensureGoFunMotionTheme(app);
  _alignDealFirstDiscovery(app);
  final api = _ensureGoFunMotionApi(app);
  _ensureAnimatedSplash(app);
  _ensureMobileAppIdentity(app);
  _ensureCompatibleMobileDependencies(app);
  _ensureFirebaseAuth(app);
  _ensurePushRegistrationAction(app);
  _ensureProductionCollectionFields(app);
  _wireProductionQueries(app, api);
  _removeQueryGuardNotices(app);
  _wireSaferSaveAndBookingActions(app, api);
  _wireRoleRouting(app, api);
  _wireAiAssistants(app, api);
  _wireCustomerBookingHistory(app, api);
  _wirePartnerDealWorkflow(app, api);
}

void _alignDealFirstDiscovery(App app) {
  app.editPage(ff.Pages.discoverPage, (page) {
    page.ensureReplaced(
      ff.Pages.discoverPage.widgets.byKey('Container_5si7c46x').single,
      Column(
        name: 'DealFirstDiscoveryHeader',
        crossAxis: CrossAxis.start,
        spacing: 12,
        children: [
          Text(
            'Last-minute fun deals near you.',
            name: 'DealFirstDiscoveryTitle',
            style: Styles.headlineSmall,
            maxLines: 3,
          ),
          Text(
            'Save on activities, date nights, and family fun with open spots today.',
            name: 'DealFirstDiscoverySubtitle',
            style: Styles.bodyMedium,
            color: Colors.secondaryText,
          ),
          Button(
            "Tonight's Deals",
            name: 'HeroDealsButton',
            width: double.infinity,
            height: 48,
            borderRadius: 8,
            icon: 'local_offer',
            onTap: Navigate(ff.Pages.dealsPage),
          ),
        ],
      ),
    );
  });
}

void _ensureGoFunMotionTheme(App app) {
  app.darkMode(enabled: true);
  app.primaryFont('Inter');
  app.secondaryFont('Inter');

  // Saturated CTA colors retain white-label contrast in both appearance modes.
  app.themeColor('primary', 0xFF087EA4, dark: 0xFF087EA4);
  app.themeColor('secondary', 0xFFD52B80, dark: 0xFFD52B80);
  app.themeColor('tertiary', 0xFF527F09, dark: 0xFFBDF45A);
  app.themeColor('alternate', 0xFFDEE3EA, dark: 0xFF30323B);
  app.themeColor('primaryBackground', 0xFFF7F8FA, dark: 0xFF0A0A0F);
  app.themeColor('secondaryBackground', 0xFFFFFFFF, dark: 0xFF16171D);
  app.themeColor('primaryText', 0xFF11141B, dark: 0xFFF5F7FB);
  app.themeColor('secondaryText', 0xFF5F6673, dark: 0xFFB5BAC6);
  app.themeColor('accent1', 0xFFDEF7FB, dark: 0xFF123039);
  app.themeColor('accent2', 0xFFFCE3F0, dark: 0xFF3C1930);
  app.themeColor('accent3', 0xFFECF8D2, dark: 0xFF233519);
  app.themeColor('accent4', 0xFFE3EEFB, dark: 0xFF162C43);
  app.themeColor('success', 0xFF4E770D, dark: 0xFFBDF45A);
  app.themeColor('warning', 0xFF955909, dark: 0xFFFFC864);
  app.themeColor('error', 0xFFBC294C, dark: 0xFFFF7093);
  app.themeColor('info', 0xFF087EA4, dark: 0xFF5DD8EF);

  app.raw((project) {
    for (final slot in const [
      'displayLarge',
      'displayMedium',
      'displaySmall',
      'headlineLarge',
      'headlineMedium',
      'headlineSmall',
      'titleLarge',
      'titleMedium',
      'titleSmall',
      'labelLarge',
      'labelMedium',
      'labelSmall',
      'bodyLarge',
      'bodyMedium',
      'bodySmall',
    ]) {
      final style = getTypographyStyle(project, slot).deepCopy();
      final muted = slot == 'bodySmall' || slot == 'labelSmall';
      style.colorValue = FFColorValue(
        inputValue: ffThemeColor(
          muted
              ? FFColor_ThemeColor.SECONDARY_TEXT
              : FFColor_ThemeColor.PRIMARY_TEXT,
        ),
      );
      style.letterSpacingValue = FFDoubleValue(inputValue: 0);
      setTypographyStyle(project, slot, style);
    }
  });
}

void _ensureCompatibleMobileDependencies(App app) {
  app.raw((project) {
    for (final dependency
        in const {
          'crypto': '3.0.7',
          'firebase_messaging': '15.2.7',
          // FlutterFlow's generated icon helpers still use the pre-v11 API.
          'font_awesome_flutter': '10.12.0',
          'page_transition': '2.2.2',
        }.entries) {
      final existing = findPubDependency(project, name: dependency.key);
      if (existing == null) {
        addPubDependency(
          project,
          name: dependency.key,
          version: dependency.value,
        );
      } else if (existing.version != dependency.value) {
        updatePubDependency(
          project,
          name: dependency.key,
          newVersion: dependency.value,
        );
      }
    }
  });
}

void _ensurePushRegistrationAction(App app) {
  app.raw((project) {
    const name = 'registerGoFunMotionPushToken';
    const description =
        'Requests notification permission and registers this signed-in device with GoFunMotion.';
    if (findCustomAction(project, name: name) == null) {
      addCustomAction(
        project,
        name: name,
        code: _registerGoFunMotionPushTokenCode,
        includeContext: true,
        description: description,
      );
      return;
    }
    updateCustomAction(
      project,
      name: name,
      code: _registerGoFunMotionPushTokenCode,
      arguments: const [],
      includeContext: true,
      description: description,
    );
  });

  app.editPage(ff.Pages.profilePage, (page) {
    page.ensureInsertedBefore(
      page.findByText('Logout'),
      Button(
        'Enable Notifications',
        name: 'EnableNotificationsButton',
        icon: 'notifications_active',
        variant: ButtonVariant.outlined,
        width: double.infinity,
        borderRadius: 8,
        onTap: CallCustomAction.named('registerGoFunMotionPushToken'),
      ),
    );
  });
}

void _ensureMobileAppIdentity(App app) {
  app.raw((project) {
    const packageName = 'com.gofunmotion.app';
    const displayName = 'GoFunMotion Deals';

    final allNames = project.ensureAllAppNames();
    if (allNames.appNames.isEmpty) {
      final environmentKey =
          project
              .ensureAppSettings()
              .ensureEnvironmentSettings()
              .ensureCurrentEnvironment()
              .key;
      allNames.appNames[environmentKey] = FFAppNames(
        packageName: packageName,
        displayName: displayName,
      );
    } else {
      for (final names in allNames.appNames.values) {
        names.packageName = packageName;
        names.displayName = displayName;
      }
    }
  });
}

final class _GoFunMotionApi {
  const _GoFunMotionApi({
    required this.bookingMessage,
    required this.bookingRequest,
    required this.getAccess,
    required this.getMyBookingRequests,
    required this.getPartnerBookingRequests,
    required this.getPartnerListings,
    required this.getSavedListings,
    required this.getSavedPlans,
    required this.partnerApplication,
    required this.partnerCopyDescription,
    required this.partnerCopyTitle,
    required this.plan,
    required this.saveListing,
    required this.savePlan,
    required this.savePartnerListing,
    required this.partnerBookingRequest,
    required this.smartSearch,
    required this.updateBookingRequestStatus,
  });

  final Endpoint bookingMessage;
  final Endpoint bookingRequest;
  final Endpoint getAccess;
  final Endpoint getMyBookingRequests;
  final Endpoint getPartnerBookingRequests;
  final Endpoint getPartnerListings;
  final Endpoint getSavedListings;
  final Endpoint getSavedPlans;
  final Endpoint partnerApplication;
  final Endpoint partnerCopyDescription;
  final Endpoint partnerCopyTitle;
  final Endpoint plan;
  final Endpoint saveListing;
  final Endpoint savePlan;
  final Endpoint savePartnerListing;
  final StructHandle partnerBookingRequest;
  final Endpoint smartSearch;
  final Endpoint updateBookingRequestStatus;
}

_GoFunMotionApi _ensureGoFunMotionApi(App app) {
  final accessBusiness = app.struct('MobileBusinessAccess', {
    'id': string,
    'name': string,
    'status': string,
  });
  final accessResponse = app.struct('MobileAccessResponse', {
    'businesses': listOf(accessBusiness),
    'defaultRoute': string,
    'isAdmin': bool_,
    'primaryBusinessId': string,
    'role': string,
    'uid': string,
  });
  final smartSearchResponse = app.struct('MobileSmartSearchResponse', {
    'assistantMessage': string,
    'count': int_,
    'provider': string,
    'setupWarning': string,
  });
  final planResult = app.struct('MobilePlanResult', {
    'summary': string,
    'title': string,
  });
  final planResponse = app.struct('MobilePlanResponse', {
    'plan': planResult,
    'provider': string,
    'setupWarning': string,
  });
  final savedListingItem = app.struct('MobileSavedListingItem', {
    'city': string,
    'id': string,
    'listingId': string,
    'listingTitle': string,
  });
  final savedPlanItem = app.struct('MobileSavedPlanItem', {
    'city': string,
    'id': string,
    'persona': string,
    'planId': string,
    'summary': string,
    'title': string,
  });
  final partnerListingItem = app.struct('MobilePartnerListingItem', {
    'approvalStatus': string,
    'availableSlots': listOf(string),
    'businessId': string,
    'businessName': string,
    'categoryIds': listOf(string),
    'cityId': string,
    'cityName': string,
    'discountPercent': int_,
    'id': string,
    'originalPrice': double_,
    'price': double_,
    'remainingSpots': int_,
    'shortDescription': string,
    'slug': string,
    'status': string,
    'title': string,
  });
  final savedListingsResponse = ff.Structs.mobileSavedListingsResponse;
  final savedPlansResponse = ff.Structs.mobileSavedPlansResponse;
  final bookingRequestItem = app.struct('MobileBookingRequest', {
    'businessName': string,
    'id': string,
    'listingTitle': string,
    'requestedDate': string,
    'requestedTime': string,
    'status': string,
  });
  final bookingRequestsResponse = app.struct(
    'MobileBookingRequestsV2Response',
    {'bookingRequests': listOf(bookingRequestItem), 'count': int_},
  );
  final bookingMessageResponse = app.struct('MobileBookingMessageResponse', {
    'message': string,
    'provider': string,
    'setupWarning': string,
  });
  final partnerListingsResponse = app.struct(
    'MobilePartnerListingsV2Response',
    {'count': int_, 'listings': listOf(partnerListingItem)},
  );
  final copyResponse = app.struct('MobilePartnerCopyResponse', {
    'provider': string,
    'setupWarning': string,
    'text': string,
  });
  final writeResponse = app.struct('MobileWriteResponse', {
    'applicationId': string,
    'listingId': string,
    'planId': string,
    'requestId': string,
    'saved': bool_,
    'synced': bool_,
  });

  app.raw((project) {
    _migrateApiResponseListField(
      project,
      responseStructName: 'MobileSavedListingsResponse',
      fieldName: 'savedListings',
      itemStructName: savedListingItem.name,
    );
    _migrateApiResponseListField(
      project,
      responseStructName: 'MobileSavedPlansResponse',
      fieldName: 'savedPlans',
      itemStructName: savedPlanItem.name,
    );
    _migrateApiResponseListField(
      project,
      responseStructName: 'MobilePartnerListingsResponse',
      fieldName: 'listings',
      itemStructName: partnerListingItem.name,
    );
  });

  const authSettings = EndpointSettings(requireAuthentication: true);
  const authHeaders = {
    'Authorization': 'Bearer [token]',
    'Content-Type': 'application/json',
  };

  final getAccess = Endpoint.get(
    'GetMyAccess',
    '/api/me/access',
    variables: {'token': string},
    headers: authHeaders,
    settings: authSettings,
    response: accessResponse,
  );
  final smartSearch = Endpoint.post(
    'SmartSearchDeals',
    '/api/ai/smart-search',
    variables: {'query': string},
    body: const {'query': '<query>'},
    response: smartSearchResponse,
  );
  final plan = Endpoint.post(
    'BuildAiPlan',
    '/api/ai/plan',
    variables: {
      'budget': string,
      'city': string,
      'vibe': string,
      'when': string,
      'who': string,
    },
    body: const {
      'budget': '<budget>',
      'city': '<city>',
      'vibe': '<vibe>',
      'when': '<when>',
      'who': '<who>',
    },
    response: planResponse,
  );
  final partnerCopyTitle = Endpoint.post(
    'ImprovePartnerTitle',
    '/api/ai/partner-copy',
    variables: {
      'businessId': string,
      'category': string,
      'text': string,
      'token': string,
    },
    headers: authHeaders,
    settings: authSettings,
    body: const {
      'businessId': '<businessId>',
      'category': '<category>',
      'field': 'title',
      'text': '<text>',
    },
    response: copyResponse,
  );
  final partnerCopyDescription = Endpoint.post(
    'ImprovePartnerDescription',
    '/api/ai/partner-copy',
    variables: {
      'businessId': string,
      'category': string,
      'text': string,
      'token': string,
    },
    headers: authHeaders,
    settings: authSettings,
    body: const {
      'businessId': '<businessId>',
      'category': '<category>',
      'field': 'description',
      'text': '<text>',
    },
    response: copyResponse,
  );
  final getSavedListings = Endpoint.get(
    'GetSavedListings',
    '/api/me/saved-listings',
    variables: {'token': string},
    headers: authHeaders,
    settings: authSettings,
    response: savedListingsResponse,
  );
  final saveListing = Endpoint.post(
    'SaveListing',
    '/api/me/saved-listings',
    variables: {'listingId': string, 'token': string},
    headers: authHeaders,
    settings: authSettings,
    body: const {'listingId': '<listingId>'},
    response: writeResponse,
  );
  final getSavedPlans = Endpoint.get(
    'GetSavedPlans',
    '/api/me/saved-plans',
    variables: {'token': string},
    headers: authHeaders,
    settings: authSettings,
    response: savedPlansResponse,
  );
  final savePlan = Endpoint.post(
    'SavePlan',
    '/api/me/saved-plans',
    variables: {
      'budget': string,
      'city': string,
      'persona': string,
      'summary': string,
      'token': string,
      'vibe': string,
      'when': string,
    },
    headers: authHeaders,
    settings: authSettings,
    body: const {
      'plan': {
        'input': {
          'budget': '<budget>',
          'city': '<city>',
          'vibe': '<vibe>',
          'when': '<when>',
          'who': '<persona>',
        },
        'persona': '<persona>',
        'summary': '<summary>',
        'title': '<persona>',
      },
    },
    response: writeResponse,
  );
  final bookingRequest = Endpoint.post(
    'CreateBookingRequest',
    '/api/booking-request',
    variables: {
      'email': string,
      'listingId': string,
      'message': string,
      'name': string,
      'partySize': int_,
      'requestedDate': string,
      'requestedTime': string,
      'token': string,
    },
    headers: authHeaders,
    settings: authSettings,
    body: const {
      'email': '<email>',
      'listingId': '<listingId>',
      'message': '<message>',
      'name': '<name>',
      'partySize': '<partySize>',
      'requestedDate': '<requestedDate>',
      'requestedTime': '<requestedTime>',
    },
    response: writeResponse,
  );
  final bookingMessage = Endpoint.post(
    'DraftBookingMessage',
    '/api/ai/booking-message',
    variables: {'intent': string, 'listingId': string, 'token': string},
    headers: authHeaders,
    settings: authSettings,
    body: const {'intent': '<intent>', 'listingId': '<listingId>'},
    response: bookingMessageResponse,
  );
  final getMyBookingRequests = Endpoint.get(
    'GetMyBookingRequests',
    '/api/me/booking-requests',
    variables: {'token': string},
    headers: authHeaders,
    settings: authSettings,
    response: bookingRequestsResponse,
  );
  final getPartnerListings = Endpoint.get(
    'GetPartnerListingsV2',
    '/api/partner/listings',
    variables: {'token': string},
    headers: authHeaders,
    settings: authSettings,
    response: partnerListingsResponse,
  );
  final getPartnerBookingRequests = Endpoint.get(
    'GetPartnerBookingRequestsV2',
    '/api/partner/booking-requests',
    variables: {'token': string},
    headers: authHeaders,
    settings: authSettings,
    response: bookingRequestsResponse,
  );
  final updateBookingRequestStatus = Endpoint.post(
    'UpdatePartnerBookingRequestStatus',
    '/api/partner/booking-requests/status',
    variables: {'requestId': string, 'status': string, 'token': string},
    headers: authHeaders,
    settings: authSettings,
    body: const {'requestId': '<requestId>', 'status': '<status>'},
    response: writeResponse,
  );
  final savePartnerListing = Endpoint.post(
    'SavePartnerListing',
    '/api/partner/listings',
    variables: {
      'availableSlot': string,
      'businessId': string,
      'category': string,
      'description': string,
      'originalPrice': string,
      'price': string,
      'remainingSpots': string,
      'saveMode': string,
      'title': string,
      'token': string,
    },
    headers: authHeaders,
    settings: authSettings,
    body: const {
      'availableSlot': '<availableSlot>',
      'bookingMode': 'request',
      'businessId': '<businessId>',
      'categoryIds': ['<category>'],
      'description': '<description>',
      'listingType': 'deal',
      'originalPrice': '<originalPrice>',
      'price': '<price>',
      'remainingSpots': '<remainingSpots>',
      'saveMode': '<saveMode>',
      'shortDescription': '<description>',
      'title': '<title>',
    },
    response: writeResponse,
  );
  final registerPushToken = Endpoint.post(
    'RegisterPushToken',
    '/api/push/register',
    variables: {
      'appVersion': string,
      'deviceLabel': string,
      'platform': string,
      'pushToken': string,
      'token': string,
    },
    headers: authHeaders,
    settings: authSettings,
    body: const {
      'appVersion': '<appVersion>',
      'deviceLabel': '<deviceLabel>',
      'platform': '<platform>',
      'provider': 'fcm',
      'token': '<pushToken>',
    },
    response: writeResponse,
  );
  final partnerApplication = Endpoint.post(
    'CreatePartnerApplication',
    '/api/partner-application',
    variables: {
      'businessName': string,
      'category': string,
      'city': string,
      'description': string,
      'email': string,
      'ownerName': string,
    },
    body: const {
      'businessName': '<businessName>',
      'category': '<category>',
      'city': '<city>',
      'description': '<description>',
      'email': '<email>',
      'offersLastMinuteDeals': true,
      'ownerName': '<ownerName>',
    },
    response: writeResponse,
  );

  app.apiGroup(
    'GoFunMotionWeb',
    baseUrl: 'https://gofunmotion.com',
    headers: const {'Accept': 'application/json'},
    endpoints: [
      getAccess,
      smartSearch,
      plan,
      partnerCopyTitle,
      partnerCopyDescription,
      getSavedListings,
      saveListing,
      getSavedPlans,
      savePlan,
      bookingRequest,
      bookingMessage,
      getMyBookingRequests,
      getPartnerListings,
      getPartnerBookingRequests,
      updateBookingRequestStatus,
      savePartnerListing,
      registerPushToken,
      partnerApplication,
    ],
  );

  return _GoFunMotionApi(
    bookingMessage: bookingMessage,
    bookingRequest: bookingRequest,
    getAccess: getAccess,
    getMyBookingRequests: getMyBookingRequests,
    getPartnerBookingRequests: getPartnerBookingRequests,
    getPartnerListings: getPartnerListings,
    getSavedListings: getSavedListings,
    getSavedPlans: getSavedPlans,
    partnerApplication: partnerApplication,
    partnerCopyDescription: partnerCopyDescription,
    partnerCopyTitle: partnerCopyTitle,
    plan: plan,
    saveListing: saveListing,
    savePlan: savePlan,
    savePartnerListing: savePartnerListing,
    partnerBookingRequest: bookingRequestItem,
    smartSearch: smartSearch,
    updateBookingRequestStatus: updateBookingRequestStatus,
  );
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
    for (final field in [
      'approvalStatus',
      'bookingMode',
      'businessId',
      'businessName',
      'cityId',
      'cityName',
      'currency',
      'description',
      'id',
      'shortDescription',
      'slug',
      'status',
      'title',
    ]) {
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
    ensureCollectionField(
      project,
      collectionName: 'listings',
      fieldName: 'categoryIds',
      type: ff_types.listOf(ff_types.stringType),
    );
    ensureCollectionField(
      project,
      collectionName: 'listings',
      fieldName: 'isDemo',
      type: ff_types.boolType,
    );
    for (final field in ['price', 'originalPrice', 'discountPercent']) {
      ensureCollectionField(
        project,
        collectionName: 'listings',
        fieldName: field,
        type: ff_types.doubleType,
      );
    }
    ensureCollectionField(
      project,
      collectionName: 'listings',
      fieldName: 'remainingSpots',
      type: ff_types.intType,
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

    for (final field in ['cityId', 'cityName', 'name', 'status']) {
      ensureCollectionField(
        project,
        collectionName: 'businesses',
        fieldName: field,
        type: ff_types.stringType,
      );
    }
    ensureCollectionField(
      project,
      collectionName: 'businesses',
      fieldName: 'ownerIds',
      type: ff_types.listOf(ff_types.stringType),
    );
  });
}

void _wireProductionQueries(App app, _GoFunMotionApi api) {
  final listings = ff.Collections.listings;
  final bookingRequestItem = api.partnerBookingRequest;
  final savedListingItem = ff.Structs.mobileSavedListingItem;
  final savedPlanItem = ff.Structs.mobileSavedPlanItem;

  app.editPageState(ff.Pages.savedPage, (state) {
    state.ensureField('bookingRequests', listOf(bookingRequestItem));
    state.ensureField(
      'bookingRequestsViewState',
      string.withDefault('loading'),
    );
    state.ensureField('savedDeals', listOf(savedListingItem));
    state.ensureField('savedPlanItems', listOf(savedPlanItem));
  });
  app.raw((project) {
    _bindSavedStructText(
      project,
      listNodeKey: 'ListView_7ht4psv0',
      textNodeKey: 'Text_iw3juq1h',
      fieldName: 'title',
    );
    _bindSavedStructText(
      project,
      listNodeKey: 'ListView_7ht4psv0',
      textNodeKey: 'Text_hplaocqi',
      fieldName: 'summary',
    );
    _bindSavedStructText(
      project,
      listNodeKey: 'ListView_7ht4psv0',
      textNodeKey: 'Text_fqeir46q',
      fieldName: 'city',
    );
    _bindSavedStructText(
      project,
      listNodeKey: 'ListView_te29ughq',
      textNodeKey: 'Text_u5mqatei',
      fieldName: 'listingTitle',
    );
    _bindSavedStructText(
      project,
      listNodeKey: 'ListView_te29ughq',
      textNodeKey: 'Text_2s2iqyyu',
      fieldName: 'city',
    );
  });

  app.editPageOnLoad(ff.Pages.discoverPage, [
    FirestoreQuery(listings, limit: 12, outputAs: 'approvedFeaturedDeals'),
    SetState(
      ff.Pages.discoverPage.state.featuredDeals,
      const ActionOutput('approvedFeaturedDeals'),
    ),
    If(
      const Global(GlobalProperty.isUserLoggedIn),
      then: [
        ApiCall(
          api.getAccess,
          outputAs: 'discoverRoleAccess',
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess:
              (result) => [
                If(
                  Equals(result['role'], 'admin'),
                  then: [
                    Navigate(
                      ff.Pages.adminPage,
                      allowBack: false,
                      replaceRoute: true,
                    ),
                  ],
                  orElse: [
                    If(
                      Equals(result['role'], 'business'),
                      then: [
                        Navigate(
                          ff.Pages.partnerDashboardPage,
                          allowBack: false,
                          replaceRoute: true,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
        ),
      ],
    ),
  ]);

  app.editPageOnLoad(ff.Pages.dealsPage, [
    FirestoreQuery(listings, limit: 50, outputAs: 'approvedDeals'),
    SetState(
      ff.Pages.dealsPage.state.deals,
      const ActionOutput('approvedDeals'),
    ),
  ]);

  app.editPageOnLoad(ff.Pages.savedPage, [
    If(
      const Global(GlobalProperty.isUserLoggedIn),
      then: [
        SetState('bookingRequestsViewState', 'loading'),
        ApiCall(
          api.getSavedPlans,
          outputAs: 'spApi2',
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess:
              (result) => [SetState('savedPlanItems', result['savedPlans'])],
        ),
        ApiCall(
          api.getSavedListings,
          outputAs: 'slApi2',
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess:
              (savedResult) => [
                SetState('savedDeals', savedResult['savedListings']),
              ],
        ),
        ApiCall(
          api.getMyBookingRequests,
          outputAs: 'myBookingRequestsApi',
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess:
              (bookingResult) => [
                SetState('bookingRequests', bookingResult['bookingRequests']),
                SetState('bookingRequestsViewState', 'ready'),
              ],
          onFailure: [SetState('bookingRequestsViewState', 'error')],
        ),
      ],
      orElse: [
        SetState.clear('savedPlanItems'),
        SetState.clear('savedDeals'),
        SetState.clear('bookingRequests'),
        SetState('bookingRequestsViewState', 'signedOut'),
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
        _QueryFilter(fieldName: 'approvalStatus', staticValue: 'approved'),
        _QueryFilter(fieldName: 'isDemo', staticValue: 'false'),
        _QueryFilter(fieldName: 'status', staticValue: 'published'),
      ],
      orderByFieldName: 'createdAt',
    );
    _patchFirestoreQueryAction(
      project,
      pageName: 'DealsPage',
      collectionName: 'listings',
      outputVariableName: 'approvedDeals',
      filters: const [
        _QueryFilter(fieldName: 'approvalStatus', staticValue: 'approved'),
        _QueryFilter(fieldName: 'isDemo', staticValue: 'false'),
        _QueryFilter(fieldName: 'status', staticValue: 'published'),
      ],
      orderByFieldName: 'createdAt',
    );
  });
}

void _migrateApiResponseListField(
  FFProject project, {
  required String responseStructName,
  required String fieldName,
  required String itemStructName,
}) {
  final itemStruct = findDataStruct(project, name: itemStructName);
  if (itemStruct == null) {
    throw StateError('Data struct "$itemStructName" was not found.');
  }

  updateDataStructField(
    project,
    structName: responseStructName,
    fieldName: fieldName,
    type: ff_types.dataStructType(itemStruct.identifier),
    isList: true,
  );
}

void _bindSavedStructText(
  FFProject project, {
  required String listNodeKey,
  required String textNodeKey,
  required String fieldName,
}) {
  final page = findPage(project, name: 'SavedPage');
  if (page == null) throw StateError('Page "SavedPage" was not found.');
  final textNode = findByKey(page.node, textNodeKey);
  if (textNode == null) {
    throw StateError('Text node "$textNodeKey" was not found on SavedPage.');
  }
  textNode.props.text.textValue = FFStringValue(
    variable: generatorVarField(listNodeKey, fieldName),
  );
}

final class _QueryFilter {
  const _QueryFilter({required this.fieldName, required this.staticValue});

  final String fieldName;
  final String staticValue;
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
    if (triggerAction.trigger.triggerType !=
            FFActionTriggerType.ON_INIT_STATE ||
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

FFAction? _findActionByOutputName(
  FFActionNode root,
  String outputVariableName,
) {
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
  required String staticValue,
}) {
  final filter = FFFirestoreFilter(
    collectionFieldIdentifier: _fieldIdentifier(
      project,
      collectionName: collectionName,
      fieldName: fieldName,
    ),
    relation: FFFirestoreFilter_Relation.EQUAL_TO,
  );
  filter.inputValue = FFParameterValue(serializedValue: staticValue);
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
  app.editPage(ff.Pages.discoverPage, (page) {
    page.ensureRemoved(page.findByName('DiscoverApprovedQueryNotice'));
  });

  app.editPage(ff.Pages.dealsPage, (page) {
    page.ensureRemoved(page.findByName('DealsApprovedQueryNotice'));
  });

  app.editPage(ff.Pages.savedPage, (page) {
    page.ensureRemoved(page.findByName('SavedUserScopedQueryNotice'));
  });
}

void _wireSaferSaveAndBookingActions(App app, _GoFunMotionApi api) {
  app.editPage(ff.Pages.findPlanPage, (page) {
    page.ensureActions(
      ff.Pages.findPlanPage.widgets.byKey('Button_lo6ifm7w').single,
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        If(
          const Global(GlobalProperty.isUserLoggedIn),
          then: [
            ApiCall(
              api.savePlan,
              outputAs: 'savedPlan',
              params: {
                'budget': State('budget'),
                'city': State('city'),
                'persona': State('persona'),
                'summary': State('planSummary'),
                'token': const AuthUser(AuthUserField.jwtToken),
                'vibe': State('vibe'),
                'when': State('when'),
              },
              onSuccess: (_) => [Snackbar('Plan saved.')],
              onFailure: [Snackbar('Plan could not be saved yet.')],
            ),
          ],
          orElse: [
            Snackbar('Sign in to save plans.'),
            Navigate(ff.Pages.signInPage),
          ],
        ),
      ],
    );
  });

  app.editPageState(ff.Pages.dealDetailPage, (state) {
    state.ensureField('requestedDate', string);
    state.ensureField('requestedTime', string);
  });

  app.editPage(ff.Pages.dealDetailPage, (page) {
    page.ensureActions(
      ff.Pages.dealDetailPage.widgets.byKey('Button_8mdxzpn5').single,
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        If(
          const Global(GlobalProperty.isUserLoggedIn),
          then: [
            ApiCall(
              api.saveListing,
              outputAs: 'savedDeal',
              params: {
                'listingId': State('listing')['id'],
                'token': const AuthUser(AuthUserField.jwtToken),
              },
              onSuccess: (_) => [Snackbar('Deal saved.')],
              onFailure: [Snackbar('Only approved live deals can be saved.')],
            ),
          ],
          orElse: [
            Snackbar('Sign in to save this deal.'),
            Navigate(ff.Pages.signInPage),
          ],
        ),
      ],
    );

    page.ensureActions(
      ff.Pages.dealDetailPage.widgets.byKey('Button_md8o2kqd').single,
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        If(
          const Global(GlobalProperty.isUserLoggedIn),
          then: [
            ApiCall(
              api.bookingRequest,
              outputAs: 'bookingRequest',
              params: {
                'email': State('contactEmail'),
                'listingId': State('listing')['id'],
                'message': WidgetState(
                  ff.Pages.dealDetailPage.widgets
                      .byKey('TextField_844shv74')
                      .single,
                  WidgetStateProperty.text,
                ),
                'name': State('contactName'),
                'partySize': State('partySize'),
                'requestedDate': State('requestedDate'),
                'requestedTime': State('requestedTime'),
                'token': const AuthUser(AuthUserField.jwtToken),
              },
              onSuccess:
                  (_) => [
                    Snackbar(
                      'Request sent. The business will confirm availability.',
                    ),
                  ],
              onFailure: [Snackbar('Check the details and try again.')],
            ),
          ],
          orElse: [
            Snackbar('Sign in to send booking requests.'),
            Navigate(ff.Pages.signInPage),
          ],
        ),
      ],
    );

    page.ensureInsertedBefore(
      ff.Pages.dealDetailPage.widgets.byKey('Button_md8o2kqd').single,
      Column(
        name: 'BookingDateTimeFields',
        spacing: 12,
        children: [
          TextField(
            name: 'RequestedDateField',
            label: 'Requested date (YYYY-MM-DD)',
            onChanged: SetState('requestedDate', const TextValue()),
          ),
          TextField(
            name: 'RequestedTimeField',
            label: 'Requested time',
            onChanged: SetState('requestedTime', const TextValue()),
          ),
        ],
      ),
    );
  });

  app.editPage(ff.Pages.partnerApplyPage, (page) {
    page.ensureActions(
      page.findByText('Submit Application'),
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        ApiCall(
          api.partnerApplication,
          outputAs: 'submittedPartnerApplication',
          params: {
            'businessName': State('businessName'),
            'category': State('category'),
            'city': State('city'),
            'description': State('description'),
            'email': State('contactEmail'),
            'ownerName': State('contactName'),
          },
          onSuccess:
              (_) => [
                Snackbar('Application submitted for admin review.'),
                Navigate(ff.Pages.partnerPage),
              ],
          onFailure: [
            Snackbar('Choose a supported city/category and check the form.'),
          ],
        ),
      ],
    );
  });
}

void _wireRoleRouting(App app, _GoFunMotionApi api) {
  app.editPageState(ff.Pages.adminPage, (state) {
    state.ensureField('isAdmin', bool_.withDefault(false));
  });
  final partnerApplications = ff.Collections.partnerApplications;
  final listings = ff.Collections.listings;
  app.editPageOnLoad(ff.Pages.adminPage, [
    If(
      const Global(GlobalProperty.isUserLoggedIn),
      then: [
        ApiCall(
          api.getAccess,
          outputAs: 'adminAccess',
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess:
              (result) => [
                SetState('isAdmin', result['isAdmin']),
                If(
                  Equals(result['isAdmin'], true),
                  then: [
                    FirestoreQuery(
                      partnerApplications,
                      limit: 25,
                      outputAs: 'adminApps',
                    ),
                    SetState('applications', const ActionOutput('adminApps')),
                    FirestoreQuery(
                      listings,
                      limit: 25,
                      outputAs: 'adminListingsQuery',
                    ),
                    SetState(
                      'adminListings',
                      const ActionOutput('adminListingsQuery'),
                    ),
                  ],
                  orElse: [
                    Snackbar('This account does not have admin access.'),
                  ],
                ),
              ],
        ),
      ],
      orElse: [SetState('isAdmin', false)],
    ),
  ]);
  app.editPage(ff.Pages.adminPage, (page) {
    page.bindVisible(
      ff.Pages.adminPage.widgets.byKey('ListView_sh90m1dy').single,
      State('isAdmin'),
    );
    page.bindVisible(
      ff.Pages.adminPage.widgets.byKey('ListView_20dqsmgf').single,
      State('isAdmin'),
    );
    page.ensureActions(
      page.findByText('Publish'),
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        Snackbar('Use the web admin to publish with a complete audit log.'),
      ],
    );
    page.ensureActions(
      page.findByText('Hide'),
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        Snackbar('Use the web admin to pause with a complete audit log.'),
      ],
    );
  });
}

void _wireAiAssistants(App app, _GoFunMotionApi api) {
  app.editPage(ff.Pages.findPlanPage, (page) {
    page.ensureActions(
      ff.Pages.findPlanPage.widgets.byKey('Button_id060slz').single,
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        ApiCall(
          api.plan,
          outputAs: 'aiPlanResult',
          params: {
            'budget': State('budget'),
            'city': State('city'),
            'vibe': State('vibe'),
            'when': State('when'),
            'who': State('persona'),
          },
          onSuccess:
              (result) => [
                SetState('planSummary', result['plan']['summary']),
                Snackbar('Plan matched against approved deals.'),
              ],
          onFailure: [Snackbar('Your safe built-in plan is still available.')],
        ),
      ],
    );
  });

  app.editPageState(ff.Pages.dealsPage, (state) {
    state.ensureField('smartQuery', string);
    state.ensureField('smartSearchSummary', string);
  });
  app.editPage(ff.Pages.dealsPage, (page) {
    page.ensureInsertedBefore(
      ff.Pages.dealsPage.widgets.byKey('ListView_zze2o7q7').single,
      Container(
        name: 'MobileSmartSearchPanel',
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 10,
          children: [
            Text('Tell us what sounds fun', style: Styles.titleMedium),
            TextField(
              name: 'MobileSmartSearchField',
              label: 'Date night tonight under \$50',
              onChanged: SetState('smartQuery', const TextValue()),
            ),
            Button(
              'Smart Search',
              name: 'MobileSmartSearchButton',
              width: double.infinity,
              height: 46,
              icon: 'search',
              borderRadius: 8,
              onTap: ApiCall(
                api.smartSearch,
                outputAs: 'mobileSmartSearchResult',
                params: {'query': State('smartQuery')},
                onSuccess:
                    (result) => [
                      SetState(
                        'smartSearchSummary',
                        result['assistantMessage'],
                      ),
                      Snackbar('Filters interpreted. Showing approved deals.'),
                    ],
                onFailure: [Snackbar('Try a more specific search.')],
              ),
            ),
            Text(
              State('smartSearchSummary'),
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
          ],
        ),
      ),
    );
  });

  app.editPageState(ff.Pages.partnerDashboardPage, (state) {
    state.ensureField('currentBusinessId', string);
    state.ensureField('copyCategory', string.withDefault('classes'));
    state.ensureField('dealAvailableSlot', string);
    state.ensureField('dealOriginalPrice', string);
    state.ensureField('dealPrice', string);
    state.ensureField('dealRemainingSpots', string);
    state.ensureField('draftDescription', string);
    state.ensureField('draftTitle', string);
    state.ensureField(
      'partnerListings',
      listOf(ff.Structs.mobilePartnerListingItem),
    );
    state.ensureField(
      'partnerListingsViewState',
      string.withDefault('loading'),
    );
    state.ensureField('partnerRequests', listOf(api.partnerBookingRequest));
    state.ensureField(
      'partnerRequestsViewState',
      string.withDefault('loading'),
    );
  });
  app.editPageOnLoad(ff.Pages.partnerDashboardPage, [
    If(
      const Global(GlobalProperty.isUserLoggedIn),
      then: [
        SetState('partnerListingsViewState', 'loading'),
        SetState('partnerRequestsViewState', 'loading'),
        ApiCall(
          api.getAccess,
          outputAs: 'partnerAccess',
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess:
              (result) => [
                SetState('currentBusinessId', result['primaryBusinessId']),
              ],
          onFailure: [
            SetState('partnerListingsViewState', 'error'),
            SetState('partnerRequestsViewState', 'error'),
          ],
        ),
        ApiCall(
          api.getPartnerListings,
          outputAs: 'partnerListingsInitialV2',
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess:
              (listingResult) => [
                SetState('partnerListings', listingResult['listings']),
                SetState('partnerListingsViewState', 'ready'),
              ],
          onFailure: [SetState('partnerListingsViewState', 'error')],
        ),
        ApiCall(
          api.getPartnerBookingRequests,
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess:
              (requestResult) => [
                SetState('partnerRequests', requestResult['bookingRequests']),
                SetState('partnerRequestsViewState', 'ready'),
              ],
          onFailure: [SetState('partnerRequestsViewState', 'error')],
        ),
      ],
      orElse: [
        SetState('partnerListingsViewState', 'signedOut'),
        SetState('partnerRequestsViewState', 'signedOut'),
      ],
    ),
  ]);
  app.editPage(ff.Pages.partnerDashboardPage, (page) {
    _upsertPartnerPanelBefore(
      page,
      page.findByText('Request Listing Setup'),
      Container(
        name: 'PartnerCopyAssistantPanel',
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 12,
          children: [
            Text('Partner Copy Assistant', style: Styles.titleMedium),
            Text(
              'Improve wording only. Price, time, discount, and availability are never invented.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            TextField(
              name: 'PartnerDraftTitleField',
              label: 'Deal title',
              onChanged: SetState('draftTitle', const TextValue()),
            ),
            Button(
              'Improve Title',
              name: 'ImprovePartnerTitleButton',
              width: double.infinity,
              height: 44,
              icon: 'auto_awesome',
              borderRadius: 8,
              onTap: ApiCall(
                api.partnerCopyTitle,
                outputAs: 'partnerTitleCopy',
                params: {
                  'businessId': State('currentBusinessId'),
                  'category': State('copyCategory'),
                  'text': State('draftTitle'),
                  'token': const AuthUser(AuthUserField.jwtToken),
                },
                onSuccess:
                    (result) => [
                      SetState('draftTitle', result['text']),
                      Snackbar('Title improved. Review it before saving.'),
                    ],
                onFailure: [
                  Snackbar('Add a title and approved business first.'),
                ],
              ),
            ),
            Text(
              State('draftTitle'),
              name: 'PartnerDraftTitlePreview',
              style: Styles.bodySmall,
              color: Colors.primary,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            TextField(
              name: 'PartnerDraftDescriptionField',
              label: 'Deal description',
              maxLines: 4,
              onChanged: SetState('draftDescription', const TextValue()),
            ),
            Button(
              'Improve Description',
              name: 'ImprovePartnerDescriptionButton',
              width: double.infinity,
              height: 44,
              icon: 'edit_note',
              borderRadius: 8,
              onTap: ApiCall(
                api.partnerCopyDescription,
                outputAs: 'partnerDescriptionCopy',
                params: {
                  'businessId': State('currentBusinessId'),
                  'category': State('copyCategory'),
                  'text': State('draftDescription'),
                  'token': const AuthUser(AuthUserField.jwtToken),
                },
                onSuccess:
                    (result) => [
                      SetState('draftDescription', result['text']),
                      Snackbar(
                        'Description improved. Review it before saving.',
                      ),
                    ],
                onFailure: [
                  Snackbar('Add a description and approved business first.'),
                ],
              ),
            ),
            Text(
              State('draftDescription'),
              name: 'PartnerDraftDescriptionPreview',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
              maxLines: 5,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  });
}

void _wireCustomerBookingHistory(App app, _GoFunMotionApi api) {
  app.editPage(ff.Pages.dealDetailPage, (page) {
    page.ensureInsertedBefore(
      ff.Pages.dealDetailPage.widgets.byKey('TextField_844shv74').single,
      Container(
        name: 'BookingMessageAssistantCard',
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 10,
          children: [
            Text('Need help with the message?', style: Styles.titleSmall),
            Text(
              'AI drafts an editable note. It never sends, confirms, or pays for anything.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            Button(
              'Draft Message with AI',
              name: 'DraftBookingMessageButton',
              width: double.infinity,
              height: 44,
              icon: 'auto_awesome',
              borderRadius: 8,
              variant: ButtonVariant.outlined,
              onTap: If(
                const Global(GlobalProperty.isUserLoggedIn),
                then: [
                  ApiCall(
                    api.bookingMessage,
                    outputAs: 'bookingMessageDraft',
                    params: {
                      'intent': WidgetState(
                        ff.Pages.dealDetailPage.widgets
                            .byKey('TextField_844shv74')
                            .single,
                        WidgetStateProperty.text,
                      ),
                      'listingId': State('listing')['id'],
                      'token': const AuthUser(AuthUserField.jwtToken),
                    },
                    onSuccess:
                        (result) => [
                          SetFormField(
                            ff.Pages.dealDetailPage.widgets
                                .byKey('TextField_844shv74')
                                .single,
                            result['message'],
                          ),
                          Snackbar('Draft ready. Review it before sending.'),
                        ],
                    onFailure: [
                      Snackbar(
                        'AI drafting is unavailable. You can still write your own message.',
                      ),
                    ],
                  ),
                ],
                orElse: [
                  Snackbar('Sign in before using the message assistant.'),
                  Navigate(ff.Pages.signInPage),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  });

  app.editPage(ff.Pages.savedPage, (page) {
    page.ensureInsertedAfter(
      ff.Pages.savedPage.widgets.byKey('ListView_te29ughq').single,
      Container(
        name: 'CustomerBookingHistorySection',
        width: double.infinity,
        margin: const EdgeInsets.only(top: 18),
        padding: const EdgeInsets.all(16),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        visible: const Global(GlobalProperty.isUserLoggedIn),
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 12,
          children: [
            Row(
              spacing: 10,
              children: [
                const Icon('event_available', size: 22, color: Colors.primary),
                Text('Booking requests', style: Styles.titleMedium),
              ],
            ),
            Text(
              'A request is not confirmed until the business changes its status.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            Text(
              'Loading your requests...',
              name: 'CustomerBookingRequestsLoading',
              style: Styles.bodyMedium,
              visible: Equals(State('bookingRequestsViewState'), 'loading'),
            ),
            Text(
              'New requests and status changes appear below as businesses respond.',
              name: 'CustomerBookingRequestsEmpty',
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
              visible: Equals(State('bookingRequestsViewState'), 'ready'),
            ),
            Text(
              'Requests could not be loaded. Check your connection and try again.',
              name: 'CustomerBookingRequestsError',
              style: Styles.bodyMedium,
              color: Colors.error,
              visible: Equals(State('bookingRequestsViewState'), 'error'),
            ),
            ListView(
              name: 'CustomerBookingRequestsList',
              source: State('bookingRequests'),
              shrinkWrap: true,
              spacing: 10,
              visible: Equals(State('bookingRequestsViewState'), 'ready'),
              itemBuilder:
                  (request) => Container(
                    padding: const EdgeInsets.all(14),
                    borderRadius: 8,
                    color: Colors.primaryBackground,
                    borderColor: Colors.alternate,
                    borderWidth: 1,
                    child: Column(
                      crossAxis: CrossAxis.start,
                      spacing: 6,
                      children: [
                        Text(
                          request['listingTitle'],
                          style: Styles.titleSmall,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          request['businessName'],
                          style: Styles.bodySmall,
                          color: Colors.secondaryText,
                        ),
                        Row(
                          spacing: 8,
                          children: [
                            const Icon(
                              'schedule',
                              size: 16,
                              color: Colors.tertiary,
                            ),
                            Text(
                              request['requestedDate'],
                              style: Styles.labelSmall,
                            ),
                            Text(
                              request['requestedTime'],
                              style: Styles.labelSmall,
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          borderRadius: 8,
                          color: Colors.accent1,
                          child: Text(
                            request['status'],
                            style: Styles.labelSmall,
                            color: Colors.primaryText,
                          ),
                        ),
                      ],
                    ),
                  ),
            ),
            Button(
              'Refresh Requests',
              name: 'RefreshCustomerBookingRequestsButton',
              width: double.infinity,
              height: 42,
              icon: 'refresh',
              borderRadius: 8,
              variant: ButtonVariant.outlined,
              onTap: [
                SetState('bookingRequestsViewState', 'loading'),
                ApiCall(
                  api.getMyBookingRequests,
                  outputAs: 'myBookingRequestsRefresh',
                  params: {'token': const AuthUser(AuthUserField.jwtToken)},
                  onSuccess:
                      (result) => [
                        SetState('bookingRequests', result['bookingRequests']),
                        SetState('bookingRequestsViewState', 'ready'),
                      ],
                  onFailure: [SetState('bookingRequestsViewState', 'error')],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  });
}

void _upsertPartnerPanelBefore(
  EditWidgetEditor page,
  Object anchor,
  DslWidget panel,
) {
  final existing =
      ff.Pages.partnerDashboardPage.widgets.all
          .where((widget) => widget.name == panel.name)
          .toList();
  if (existing.isEmpty) {
    page.ensureInsertedBefore(anchor, panel);
    return;
  }
  // Several panels share one anchor; adjacent-sibling insertion is not enough.
  page.ensureReplaced(existing.single, panel);
}

void _wirePartnerDealWorkflow(App app, _GoFunMotionApi api) {
  app.editPage(ff.Pages.partnerDashboardPage, (page) {
    final setupButton = page.findByText('Request Listing Setup');

    _upsertPartnerPanelBefore(
      page,
      setupButton,
      Container(
        name: 'PartnerDealFactsPanel',
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.primary,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 12,
          children: [
            Row(
              spacing: 10,
              children: [
                const Icon('bolt', size: 22, color: Colors.primary),
                Text('Finish deal details', style: Styles.titleMedium),
              ],
            ),
            Text(
              'Use the title and description above, then add the real price, time, and capacity. AI never changes these facts.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            Dropdown(
              name: 'PartnerDealCategoryDropdown',
              label: 'Category',
              value: State('copyCategory'),
              options: const [
                'classes',
                'date-night',
                'events',
                'family',
                'fitness',
                'food-drink',
                'friends',
                'nightlife',
                'outdoor',
                'wellness',
              ],
              onChanged: SetState('copyCategory', const WidgetValue()),
            ),
            TextField(
              name: 'PartnerDealOriginalPriceField',
              label: 'Was price',
              keyboard: Keyboard.number,
              onChanged: SetState('dealOriginalPrice', const TextValue()),
            ),
            TextField(
              name: 'PartnerDealPriceField',
              label: 'Now price',
              keyboard: Keyboard.number,
              onChanged: SetState('dealPrice', const TextValue()),
            ),
            TextField(
              name: 'PartnerDealAvailableSlotField',
              label: 'Available date and time',
              hint: 'Tonight 8:30 PM',
              onChanged: SetState('dealAvailableSlot', const TextValue()),
            ),
            TextField(
              name: 'PartnerDealRemainingSpotsField',
              label: 'Spots left',
              keyboard: Keyboard.number,
              onChanged: SetState('dealRemainingSpots', const TextValue()),
            ),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              borderRadius: 8,
              color: Colors.accent1,
              child: Row(
                spacing: 8,
                children: [
                  const Icon('verified_user', size: 18, color: Colors.primary),
                  Expanded(
                    Text(
                      'Submitted deals stay hidden until admin approval. Starter includes one active deal.',
                      style: Styles.bodySmall,
                    ),
                  ),
                ],
              ),
            ),
            Button(
              'Save Draft',
              name: 'SavePartnerDealDraftButton',
              width: double.infinity,
              height: 46,
              icon: 'save',
              borderRadius: 8,
              variant: ButtonVariant.outlined,
              onTap: _savePartnerDealActions(
                api,
                saveMode: 'draft',
                outputPrefix: 'partnerDraft',
              ),
            ),
            Button(
              'Submit for Review',
              name: 'SubmitPartnerDealButton',
              width: double.infinity,
              height: 48,
              icon: 'send',
              borderRadius: 8,
              onTap: _savePartnerDealActions(
                api,
                saveMode: 'submit',
                outputPrefix: 'partnerSubmit',
              ),
            ),
          ],
        ),
      ),
    );

    _upsertPartnerPanelBefore(
      page,
      setupButton,
      Container(
        name: 'PartnerListingsPanel',
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 12,
          children: [
            Text('Your deals', style: Styles.titleMedium),
            Text(
              'Draft, pending, and published deals from your approved business.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            Text(
              'Loading deals...',
              style: Styles.bodyMedium,
              visible: Equals(State('partnerListingsViewState'), 'loading'),
            ),
            Text(
              'Draft, pending, and published deals appear below.',
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
              visible: Equals(State('partnerListingsViewState'), 'ready'),
            ),
            Text(
              'Deals could not be loaded. Confirm business approval and try again.',
              style: Styles.bodyMedium,
              color: Colors.error,
              visible: Equals(State('partnerListingsViewState'), 'error'),
            ),
            ListView(
              name: 'PartnerListingsList',
              source: State('partnerListings'),
              shrinkWrap: true,
              spacing: 10,
              visible: Equals(State('partnerListingsViewState'), 'ready'),
              itemBuilder:
                  (listing) => Container(
                    padding: const EdgeInsets.all(14),
                    borderRadius: 8,
                    color: Colors.primaryBackground,
                    borderColor: Colors.alternate,
                    borderWidth: 1,
                    child: Column(
                      crossAxis: CrossAxis.start,
                      spacing: 7,
                      children: [
                        Text(
                          listing['title'],
                          style: Styles.titleSmall,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          listing['status'],
                          style: Styles.labelSmall,
                          color: Colors.primary,
                        ),
                        Row(
                          spacing: 8,
                          children: [
                            Text('Was', style: Styles.labelSmall),
                            Text(
                              listing['originalPrice'],
                              style: Styles.bodyMedium,
                            ),
                            Text('Now', style: Styles.labelSmall),
                            Text(
                              listing['price'],
                              style: Styles.titleSmall,
                              color: Colors.primary,
                            ),
                          ],
                        ),
                        Row(
                          spacing: 8,
                          children: [
                            const Icon(
                              'group',
                              size: 16,
                              color: Colors.tertiary,
                            ),
                            Text(
                              listing['remainingSpots'],
                              style: Styles.bodySmall,
                            ),
                            Text('spots left', style: Styles.bodySmall),
                          ],
                        ),
                      ],
                    ),
                  ),
            ),
            Button(
              'Refresh Deals',
              name: 'RefreshPartnerListingsButton',
              width: double.infinity,
              height: 42,
              icon: 'refresh',
              borderRadius: 8,
              variant: ButtonVariant.outlined,
              onTap: _refreshPartnerListingsActions(
                api,
                outputAs: 'partnerListingsManualRefresh',
              ),
            ),
          ],
        ),
      ),
    );

    _upsertPartnerPanelBefore(
      page,
      setupButton,
      Container(
        name: 'PartnerBookingInboxPanel',
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 12,
          children: [
            Text('Booking request inbox', style: Styles.titleMedium),
            Text(
              'Update customers promptly. Email and push notifications are sent by the secure web backend.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            Text(
              'Loading requests...',
              style: Styles.bodyMedium,
              visible: Equals(State('partnerRequestsViewState'), 'loading'),
            ),
            Text(
              'New customer requests appear below as soon as they arrive.',
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
              visible: Equals(State('partnerRequestsViewState'), 'ready'),
            ),
            Text(
              'Requests could not be loaded. Check owner access and try again.',
              style: Styles.bodyMedium,
              color: Colors.error,
              visible: Equals(State('partnerRequestsViewState'), 'error'),
            ),
            ListView(
              name: 'PartnerBookingRequestsList',
              source: State('partnerRequests'),
              shrinkWrap: true,
              spacing: 10,
              visible: Equals(State('partnerRequestsViewState'), 'ready'),
              itemBuilder:
                  (request) => Container(
                    padding: const EdgeInsets.all(14),
                    borderRadius: 8,
                    color: Colors.primaryBackground,
                    borderColor: Colors.alternate,
                    borderWidth: 1,
                    child: Column(
                      crossAxis: CrossAxis.start,
                      spacing: 8,
                      children: [
                        Text(
                          request['listingTitle'],
                          style: Styles.titleSmall,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Row(
                          spacing: 8,
                          children: [
                            Text(
                              request['requestedDate'],
                              style: Styles.bodySmall,
                            ),
                            Text(
                              request['requestedTime'],
                              style: Styles.bodySmall,
                            ),
                          ],
                        ),
                        Text(
                          request['status'],
                          style: Styles.labelSmall,
                          color: Colors.primary,
                        ),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            Button(
                              'Contacted',
                              name: 'MarkPartnerRequestContactedButton',
                              height: 40,
                              icon: 'mail',
                              borderRadius: 8,
                              variant: ButtonVariant.outlined,
                              onTap: _updatePartnerRequestStatusActions(
                                api,
                                request,
                                status: 'contacted',
                                outputPrefix: 'contacted',
                              ),
                            ),
                            Button(
                              'Confirm',
                              name: 'MarkPartnerRequestConfirmedButton',
                              height: 40,
                              icon: 'check_circle',
                              borderRadius: 8,
                              onTap: _updatePartnerRequestStatusActions(
                                api,
                                request,
                                status: 'confirmed',
                                outputPrefix: 'confirmed',
                              ),
                            ),
                            Button(
                              'Cancel',
                              name: 'MarkPartnerRequestCancelledButton',
                              height: 40,
                              icon: 'cancel',
                              borderRadius: 8,
                              variant: ButtonVariant.text,
                              onTap: _updatePartnerRequestStatusActions(
                                api,
                                request,
                                status: 'cancelled',
                                outputPrefix: 'cancelled',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
            ),
            Button(
              'Refresh Inbox',
              name: 'RefreshPartnerBookingRequestsButton',
              width: double.infinity,
              height: 42,
              icon: 'refresh',
              borderRadius: 8,
              variant: ButtonVariant.outlined,
              onTap: _refreshPartnerRequestsActions(
                api,
                outputAs: 'partnerRequestsManualRefresh',
              ),
            ),
          ],
        ),
      ),
    );
  });
}

List<DslAction> _savePartnerDealActions(
  _GoFunMotionApi api, {
  required String saveMode,
  required String outputPrefix,
}) => [
  If(
    Equals(State('currentBusinessId'), ''),
    then: [Snackbar('An approved business is required before creating deals.')],
    orElse: [
      ApiCall(
        api.savePartnerListing,
        outputAs: '${outputPrefix}Save',
        params: {
          'availableSlot': State('dealAvailableSlot'),
          'businessId': State('currentBusinessId'),
          'category': State('copyCategory'),
          'description': State('draftDescription'),
          'originalPrice': State('dealOriginalPrice'),
          'price': State('dealPrice'),
          'remainingSpots': State('dealRemainingSpots'),
          'saveMode': saveMode,
          'title': State('draftTitle'),
          'token': const AuthUser(AuthUserField.jwtToken),
        },
        onSuccess:
            (_) => [
              Snackbar(
                saveMode == 'draft'
                    ? 'Draft saved.'
                    : 'Deal submitted for admin review.',
              ),
              ..._refreshPartnerListingsActions(
                api,
                outputAs: '${outputPrefix}ListingsRefresh',
              ),
            ],
        onFailure: [
          Snackbar(
            'Could not save. Check required fields, prices, plan limits, and review notes.',
          ),
        ],
      ),
    ],
  ),
];

List<DslAction> _refreshPartnerListingsActions(
  _GoFunMotionApi api, {
  required String outputAs,
}) => [
  SetState('partnerListingsViewState', 'loading'),
  ApiCall(
    api.getPartnerListings,
    outputAs: outputAs,
    params: {'token': const AuthUser(AuthUserField.jwtToken)},
    onSuccess:
        (result) => [
          SetState('partnerListings', result['listings']),
          SetState('partnerListingsViewState', 'ready'),
        ],
    onFailure: [SetState('partnerListingsViewState', 'error')],
  ),
];

List<DslAction> _refreshPartnerRequestsActions(
  _GoFunMotionApi api, {
  required String outputAs,
}) => [
  SetState('partnerRequestsViewState', 'loading'),
  ApiCall(
    api.getPartnerBookingRequests,
    outputAs: outputAs,
    params: {'token': const AuthUser(AuthUserField.jwtToken)},
    onSuccess:
        (result) => [
          SetState('partnerRequests', result['bookingRequests']),
          SetState('partnerRequestsViewState', 'ready'),
        ],
    onFailure: [SetState('partnerRequestsViewState', 'error')],
  ),
];

List<DslAction> _updatePartnerRequestStatusActions(
  _GoFunMotionApi api,
  ItemRef request, {
  required String status,
  required String outputPrefix,
}) => [
  ApiCall(
    api.updateBookingRequestStatus,
    outputAs: '${outputPrefix}RequestUpdate',
    params: {
      'requestId': request['id'],
      'status': status,
      'token': const AuthUser(AuthUserField.jwtToken),
    },
    onSuccess:
        (_) => [
          Snackbar('Request marked $status. The customer will be notified.'),
          ..._refreshPartnerRequestsActions(
            api,
            outputAs: '${outputPrefix}RequestsRefresh',
          ),
        ],
    onFailure: [
      Snackbar('Status could not be updated. Confirm business owner access.'),
    ],
  ),
];

void _ensureAnimatedSplash(App app) {
  app.ensurePage(
    'SplashPage',
    route: '/splash',
    description: 'Animated GoFunMotion intro splash using the brand GIF asset.',
    isInitial: true,
    onLoad: [
      const Wait(2300),
      Navigate(ff.Pages.discoverPage, allowBack: false, replaceRoute: true),
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

const _registerGoFunMotionPushTokenCode = r'''
import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

const _goFunMotionPushEndpoint =
    'https://gofunmotion.com/api/push/register';

void _showGoFunMotionPushMessage(BuildContext context, String message) {
  ScaffoldMessenger.of(context).hideCurrentSnackBar();
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message)),
  );
}

String? _goFunMotionPushPlatform() {
  if (kIsWeb) return null;
  return switch (defaultTargetPlatform) {
    TargetPlatform.android => 'android',
    TargetPlatform.iOS => 'ios',
    _ => null,
  };
}

String _goFunMotionPushResponseMessage(http.Response response) {
  try {
    final decoded = jsonDecode(response.body);
    if (decoded is Map && decoded['error'] is String) {
      return decoded['error'] as String;
    }
  } catch (_) {
    // Fall through to a safe, user-facing message.
  }
  return response.statusCode >= 200 && response.statusCode < 300
      ? 'Notifications are enabled on this device.'
      : 'Notifications could not be enabled. Try again.';
}

Future<void> registerGoFunMotionPushToken(BuildContext context) async {
  final user = FirebaseAuth.instance.currentUser;
  final platform = _goFunMotionPushPlatform();
  if (user == null) {
    _showGoFunMotionPushMessage(context, 'Sign in to enable notifications.');
    return;
  }
  if (platform == null) {
    _showGoFunMotionPushMessage(
      context,
      'Enable notifications from the iOS or Android app.',
    );
    return;
  }

  try {
    final messaging = FirebaseMessaging.instance;
    final permission = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    if (permission.authorizationStatus == AuthorizationStatus.denied) {
      if (context.mounted) {
        _showGoFunMotionPushMessage(
          context,
          'Notifications are disabled in your device settings.',
        );
      }
      return;
    }

    final pushToken = await messaging.getToken();
    final authToken = await user.getIdToken();
    if (pushToken == null || pushToken.length <= 20 || authToken == null) {
      if (context.mounted) {
        _showGoFunMotionPushMessage(
          context,
          'A notification token is not available yet. Try again shortly.',
        );
      }
      return;
    }

    final response = await http
        .post(
          Uri.parse(_goFunMotionPushEndpoint),
          headers: {
            'Authorization': 'Bearer $authToken',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'appVersion': 'flutterflow',
            'locale': WidgetsBinding.instance.platformDispatcher.locale
                .toLanguageTag(),
            'platform': platform,
            'provider': 'fcm',
            'token': pushToken,
          }),
        )
        .timeout(const Duration(seconds: 10));
    if (context.mounted) {
      _showGoFunMotionPushMessage(
        context,
        _goFunMotionPushResponseMessage(response),
      );
    }
  } catch (_) {
    if (context.mounted) {
      _showGoFunMotionPushMessage(
        context,
        'Notifications could not be enabled. Try again.',
      );
    }
  }
}
''';
