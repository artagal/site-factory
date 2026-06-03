library;

import 'dart:io';

import 'package:flutterflow_ai/flutterflow_ai.dart';

Future<void> main(List<String> args) async {
  final options = _parseCliOptions(args);
  try {
    await flutterFlowAI(
      buildGoFunMotionDeals,
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
Run the GoFunMotion Deals FlutterFlow AI create flow.

Usage:
  dart run dsl/create.dart [options]

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

void buildGoFunMotionDeals(App app) {
  _configureDesignSystem(app);
  _configureBrandAssets(app);

  app.constant('appName', 'GoFunMotion Deals');
  app.constant('defaultCity', 'Los Angeles');
  app.constant('supportEmail', 'partners@gofunmotion.com');

  app.state(
    'activeCity',
    string.withDefault('Los Angeles'),
    description: 'Last selected city for local deal discovery.',
    persisted: true,
  );
  app.state(
    'planPersona',
    string.withDefault('Date Night'),
    description: 'Last selected plan finder intent.',
    persisted: true,
  );

  final users = app.collection(
    'users',
    description: 'Firebase auth user profiles and role metadata.',
    fields: {
      'display_name': string,
      'photo_url': imagePath,
      'uid': string,
      'created_time': dateTime,
      'phone_number': string,
      'email': string,
      'role': string,
      'city': string,
      'createdAt': dateTime,
      'updatedAt': dateTime,
    },
  );

  final cities = app.collection(
    'cities',
    description: 'Supported city markets for GoFunMotion Deals.',
    fields: {
      'name': string,
      'state': string,
      'slug': string,
      'isActive': bool_,
      'sortOrder': int_,
    },
  );

  final categories = app.collection(
    'categories',
    description: 'Marketplace activity categories.',
    fields: {
      'name': string,
      'slug': string,
      'icon': string,
      'isActive': bool_,
      'sortOrder': int_,
    },
  );

  final businesses = app.collection(
    'businesses',
    description: 'Partner business profiles pending or approved by admins.',
    fields: {
      'name': string,
      'ownerUserId': string,
      'contactEmail': string,
      'city': string,
      'status': string,
      'description': string,
      'createdAt': dateTime,
      'updatedAt': dateTime,
    },
  );

  final listings = app.collection(
    'listings',
    description: 'Approved activity deal listings shown in the marketplace.',
    fields: {
      'title': string,
      'description': string,
      'businessName': string,
      'businessRef': docRef(businesses),
      'category': string,
      'city': string,
      'neighborhood': string,
      'priceLabel': string,
      'dealLabel': string,
      'bookingMode': string,
      'imageUrl': imagePath,
      'status': string,
      'isApproved': bool_,
      'isDemo': bool_,
      'startsAt': dateTime,
      'endsAt': dateTime,
      'createdAt': dateTime,
      'updatedAt': dateTime,
    },
  );

  final savedListings = app.collection(
    'savedListings',
    description: 'User-saved deal references.',
    fields: {
      'userId': string,
      'listingRef': docRef(listings),
      'listingTitle': string,
      'city': string,
      'createdAt': dateTime,
    },
  );

  final savedPlans = app.collection(
    'savedPlans',
    description: 'User-saved plan finder outputs and filters.',
    fields: {
      'userId': string,
      'city': string,
      'persona': string,
      'when': string,
      'budget': string,
      'vibe': string,
      'summary': string,
      'createdAt': dateTime,
    },
  );

  final bookingRequests = app.collection(
    'bookingRequests',
    description: 'Booking request leads sent to approved partners.',
    fields: {
      'userId': string,
      'listingRef': docRef(listings),
      'listingTitle': string,
      'contactName': string,
      'contactEmail': string,
      'partySize': int_,
      'message': string,
      'status': string,
      'createdAt': dateTime,
    },
  );

  final partnerApplications = app.collection(
    'partnerApplications',
    description: 'Inbound business applications for admin review.',
    fields: {
      'businessName': string,
      'contactName': string,
      'contactEmail': string,
      'city': string,
      'category': string,
      'description': string,
      'status': string,
      'createdAt': dateTime,
    },
  );

  final waitlist = app.collection(
    'waitlist',
    description: 'Consumer waitlist and launch notifications.',
    fields: {
      'email': string,
      'city': string,
      'interest': string,
      'createdAt': dateTime,
    },
  );

  final sectionHeader = app.component(
    'SectionHeader',
    description: 'Compact reusable section title with optional eyebrow copy.',
    params: {'eyebrow': string, 'title': string, 'subtitle': string},
    body: Column(
      crossAxis: CrossAxis.start,
      spacing: 6,
      children: [
        Text(
          Param('eyebrow'),
          style: Styles.labelSmall,
          color: Colors.secondary,
        ),
        Text(Param('title'), style: Styles.titleLarge),
        Text(
          Param('subtitle'),
          style: Styles.bodyMedium,
          color: Colors.secondaryText,
        ),
      ],
    ),
  );

  final dealCard = app.component(
    'DealCard',
    description: 'Builder-native deal card for lists and detail previews.',
    params: {
      'title': string,
      'businessName': string,
      'category': string,
      'city': string,
      'neighborhood': string,
      'priceLabel': string,
      'dealLabel': string,
      'isDemo': bool_,
      'onTapAction': action,
    },
    body: Container(
      color: Colors.secondaryBackground,
      padding: const EdgeInsets.all(16),
      borderRadius: 8,
      borderColor: Colors.alternate,
      borderWidth: 1,
      shadow: Shadow(blur: 10, dy: 4, color: Colors.hex(0x14000000)),
      onTap: const ParamAction('onTapAction'),
      child: Column(
        crossAxis: CrossAxis.start,
        spacing: 12,
        children: [
          Row(
            mainAxis: MainAxis.spaceBetween,
            crossAxis: CrossAxis.start,
            spacing: 12,
            children: [
              Expanded(
                Column(
                  crossAxis: CrossAxis.start,
                  spacing: 4,
                  children: [
                    Text(
                      Param('title'),
                      style: Styles.titleMedium,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      Param('businessName'),
                      style: Styles.bodySmall,
                      color: Colors.secondaryText,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                borderRadius: 8,
                color: Colors.accent1,
                child: Text(
                  Param('dealLabel'),
                  style: Styles.labelSmall,
                  color: Colors.primary,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          Row(
            spacing: 8,
            scrollable: true,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                borderRadius: 8,
                color: Colors.accent3,
                child: Row(
                  spacing: 4,
                  children: [
                    const Icon(
                      'local_activity',
                      size: 14,
                      color: Colors.success,
                    ),
                    Text(Param('category'), style: Styles.labelSmall),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                borderRadius: 8,
                color: Colors.accent4,
                child: Row(
                  spacing: 4,
                  children: [
                    const Icon('location_on', size: 14, color: Colors.tertiary),
                    Text(Param('city'), style: Styles.labelSmall),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                borderRadius: 8,
                color: Colors.accent2,
                child: Row(
                  spacing: 4,
                  children: [
                    const Icon('payments', size: 14, color: Colors.secondary),
                    Text(Param('priceLabel'), style: Styles.labelSmall),
                  ],
                ),
              ),
            ],
          ),
          Row(
            mainAxis: MainAxis.spaceBetween,
            spacing: 12,
            children: [
              Expanded(
                Text(
                  Param('neighborhood'),
                  style: Styles.bodySmall,
                  color: Colors.secondaryText,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                visible: Param('isDemo'),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                borderRadius: 8,
                color: Colors.warning,
                child: Text(
                  'Demo preview',
                  style: Styles.labelSmall,
                  color: Colors.primaryBackground,
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );

  final planStepCard = app.component(
    'PlanStepCard',
    description: 'One suggested step inside a plan finder result.',
    params: {
      'icon': string,
      'title': string,
      'subtitle': string,
      'meta': string,
    },
    body: Container(
      color: Colors.secondaryBackground,
      padding: const EdgeInsets.all(14),
      borderRadius: 8,
      borderColor: Colors.alternate,
      borderWidth: 1,
      child: Row(
        crossAxis: CrossAxis.start,
        spacing: 12,
        children: [
          Container(
            width: 42,
            height: 42,
            borderRadius: 8,
            color: Colors.accent2,
            child: const Icon(
              'check_circle',
              color: Colors.secondary,
              size: 22,
            ),
          ),
          Expanded(
            Column(
              crossAxis: CrossAxis.start,
              spacing: 4,
              children: [
                Text(Param('title'), style: Styles.titleSmall),
                Text(
                  Param('subtitle'),
                  style: Styles.bodySmall,
                  color: Colors.secondaryText,
                ),
                Text(
                  Param('meta'),
                  style: Styles.labelSmall,
                  color: Colors.primary,
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );

  final emptyState = app.component(
    'EmptyState',
    description: 'Reusable empty state that can stay editable in Builder.',
    params: {
      'icon': string,
      'title': string,
      'body': string,
      'buttonLabel': string,
      'onTapAction': action,
    },
    body: Container(
      padding: const EdgeInsets.all(20),
      borderRadius: 8,
      borderColor: Colors.alternate,
      borderWidth: 1,
      color: Colors.secondaryBackground,
      child: Column(
        crossAxis: CrossAxis.start,
        spacing: 12,
        children: [
          const Icon('info', color: Colors.primary, size: 34),
          Text(Param('title'), style: Styles.titleMedium),
          Text(
            Param('body'),
            style: Styles.bodyMedium,
            color: Colors.secondaryText,
          ),
          Button(
            Param('buttonLabel'),
            icon: 'arrow_forward',
            height: 44,
            borderRadius: 8,
            onTap: const ParamAction('onTapAction'),
          ),
        ],
      ),
    ),
  );

  final queryGuardNotice = app.component(
    'QueryGuardNotice',
    description:
        'Small native notice for screens waiting on approved or user-scoped Builder query filters.',
    params: {'title': string, 'body': string},
    body: Container(
      padding: const EdgeInsets.all(14),
      borderRadius: 8,
      borderColor: Colors.alternate,
      borderWidth: 1,
      color: Colors.secondaryBackground,
      child: Column(
        crossAxis: CrossAxis.start,
        spacing: 6,
        children: [
          Text(Param('title'), style: Styles.titleSmall),
          Text(
            Param('body'),
            style: Styles.bodySmall,
            color: Colors.secondaryText,
          ),
        ],
      ),
    ),
  );

  final resetPasswordPage = app.page(
    'ResetPasswordPage',
    route: '/reset-password',
    state: {'email': string},
    body: Scaffold(
      appBar: AppBar(title: 'Reset password'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Account',
            title: 'Get a reset link',
            subtitle: 'Enter the email address connected to your account.',
          ),
          TextField(
            name: 'ResetEmailField',
            label: 'Email',
            keyboard: Keyboard.email,
            onChanged: SetState('email', const TextValue()),
          ),
          Button(
            'Send Reset Link',
            name: 'SendResetLinkButton',
            width: double.infinity,
            height: 48,
            icon: 'mail',
            borderRadius: 8,
            onTap: [
              ResetPassword(State('email')),
              Snackbar('Reset link sent if this email exists.'),
              const NavigateBack(),
            ],
          ),
        ],
      ),
    ),
  );

  final signInPage = app.page(
    'SignInPage',
    route: '/sign-in',
    state: {
      'email': string,
      'password': string,
      'displayName': string,
      'isSignup': bool_.withDefault(false),
    },
    body: Scaffold(
      appBar: AppBar(title: 'GoFunMotion'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Save plans and deals',
            title: 'Welcome back',
            subtitle:
                'Browse without an account. Sign in when you want to save, request a booking, or manage partner listings.',
          ),
          Container(
            padding: const EdgeInsets.all(16),
            borderRadius: 8,
            color: Colors.secondaryBackground,
            borderColor: Colors.alternate,
            borderWidth: 1,
            child: Column(
              spacing: 12,
              children: [
                TextField(
                  name: 'EmailField',
                  label: 'Email',
                  keyboard: Keyboard.email,
                  onChanged: SetState('email', const TextValue()),
                ),
                TextField(
                  name: 'PasswordField',
                  label: 'Password',
                  obscureText: true,
                  onChanged: SetState('password', const TextValue()),
                ),
                Button(
                  'Sign In',
                  name: 'SignInButton',
                  width: double.infinity,
                  height: 48,
                  icon: 'login',
                  borderRadius: 8,
                  onTap: [
                    LoginEmailPassword(State('email'), State('password')),
                  ],
                ),
                Button(
                  'Create Account',
                  name: 'CreateAccountButton',
                  variant: ButtonVariant.outlined,
                  width: double.infinity,
                  height: 48,
                  icon: 'person_add',
                  borderRadius: 8,
                  onTap: [
                    SignupEmailPassword(
                      State('email'),
                      State('password'),
                      confirmPassword: State('password'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Row(
            spacing: 10,
            children: [
              Expanded(
                Button(
                  'Google',
                  name: 'GoogleSignInButton',
                  variant: ButtonVariant.outlined,
                  height: 46,
                  icon: 'g_mobiledata',
                  borderRadius: 8,
                  onTap: const [LoginWithGoogle()],
                ),
              ),
              Expanded(
                Button(
                  'Apple',
                  name: 'AppleSignInButton',
                  variant: ButtonVariant.outlined,
                  height: 46,
                  icon: 'apple',
                  borderRadius: 8,
                  onTap: const [LoginWithApple()],
                ),
              ),
            ],
          ),
          Button(
            'Continue as Guest',
            name: 'GuestSignInButton',
            variant: ButtonVariant.text,
            width: double.infinity,
            icon: 'person_outline',
            onTap: const [LoginAnonymously()],
          ),
          Button(
            'Forgot Password?',
            name: 'ForgotPasswordButton',
            variant: ButtonVariant.text,
            width: double.infinity,
            onTap: Navigate.to(resetPasswordPage),
          ),
        ],
      ),
    ),
  );

  final waitlistPage = app.page(
    'WaitlistPage',
    route: '/waitlist',
    state: {
      'email': string,
      'city': string.withDefault('Los Angeles'),
      'interest': string.withDefault('Deals near me'),
    },
    body: Scaffold(
      appBar: AppBar(title: 'Waitlist'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Launch access',
            title: 'Get notified first',
            subtitle:
                'Join the launch list for local activity deals in your city.',
          ),
          TextField(
            name: 'WaitlistEmailField',
            label: 'Email',
            keyboard: Keyboard.email,
            onChanged: SetState('email', const TextValue()),
          ),
          TextField(
            name: 'WaitlistCityField',
            label: 'City',
            onChanged: SetState('city', const TextValue()),
          ),
          Dropdown(
            name: 'WaitlistInterestDropdown',
            label: 'What are you looking for?',
            value: State('interest'),
            options: const [
              'Deals near me',
              'Date night ideas',
              'Friends and groups',
              'Family and kids',
              'Partner listings',
            ],
            onChanged: SetState('interest', const WidgetValue()),
          ),
          Button(
            'Join Waitlist',
            width: double.infinity,
            height: 48,
            icon: 'notifications_active',
            borderRadius: 8,
            onTap: [
              FirestoreCreate(
                waitlist,
                fields: {
                  'email': State('email'),
                  'city': State('city'),
                  'interest': State('interest'),
                  'createdAt': const Global(GlobalProperty.currentTimestamp),
                },
                outputAs: 'waitlistSignup',
              ),
              Snackbar('You are on the launch list.'),
              const NavigateBack(),
            ],
          ),
        ],
      ),
    ),
  );

  final dealDetailPage = app.page(
    'DealDetailPage',
    route: '/deal-detail',
    params: {'listingRef': docRef(listings)},
    state: {
      'listing': listings,
      'contactName': string,
      'contactEmail': string,
      'partySize': int_.withDefault(2),
      'message': string,
    },
    onLoad: [
      FirestoreRead(listings, PageParam('listingRef'), outputAs: 'detailDeal'),
      SetState('listing', const ActionOutput('detailDeal')),
    ],
    body: Scaffold(
      appBar: AppBar(title: 'Deal details'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 18,
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            borderRadius: 8,
            gradient: Gradient.linear([
              GradientStop(Colors.accent1, 0),
              GradientStop(Colors.accent2, 1),
            ], angle: 35),
            child: Column(
              crossAxis: CrossAxis.start,
              spacing: 10,
              children: [
                Text(
                  State('listing')['category'],
                  style: Styles.labelMedium,
                  color: Colors.primary,
                ),
                Text(
                  State('listing')['title'],
                  style: Styles.headlineSmall,
                  color: Colors.primaryText,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  State('listing')['description'],
                  style: Styles.bodyMedium,
                  color: Colors.secondaryText,
                ),
              ],
            ),
          ),
          Row(
            spacing: 8,
            scrollable: true,
            children: [
              Chip('Approved only', icon: 'verified'),
              Chip('Booking request', icon: 'event_available'),
              Chip('No checkout yet', icon: 'payments'),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(16),
            borderRadius: 8,
            color: Colors.secondaryBackground,
            borderColor: Colors.alternate,
            borderWidth: 1,
            child: Column(
              crossAxis: CrossAxis.start,
              spacing: 8,
              children: [
                Text(
                  State('listing')['businessName'],
                  style: Styles.titleMedium,
                ),
                Text(
                  State('listing')['neighborhood'],
                  style: Styles.bodyMedium,
                  color: Colors.secondaryText,
                ),
                Row(
                  spacing: 8,
                  children: [
                    Chip('Price', icon: 'sell'),
                    Text(
                      State('listing')['priceLabel'],
                      style: Styles.bodyMedium,
                    ),
                  ],
                ),
                Row(
                  spacing: 8,
                  children: [
                    Chip('Deal', icon: 'local_offer'),
                    Text(
                      State('listing')['dealLabel'],
                      style: Styles.bodyMedium,
                    ),
                  ],
                ),
              ],
            ),
          ),
          Button(
            'Save Deal',
            name: 'SaveDealButton',
            width: double.infinity,
            height: 48,
            icon: 'bookmark_add',
            borderRadius: 8,
            onTap: [
              If(
                const Global(GlobalProperty.isUserLoggedIn),
                then: [
                  FirestoreCreate(
                    savedListings,
                    fields: {
                      'userId': const AuthUser(AuthUserField.userId),
                      'listingRef': PageParam('listingRef'),
                      'listingTitle': State('listing')['title'],
                      'city': State('listing')['city'],
                      'createdAt': const Global(
                        GlobalProperty.currentTimestamp,
                      ),
                    },
                    outputAs: 'savedDeal',
                  ),
                  Snackbar('Deal saved.'),
                ],
                orElse: [
                  Snackbar('Sign in to save this deal.'),
                  Navigate.to(signInPage),
                ],
              ),
            ],
          ),
          sectionHeader(
            eyebrow: 'Request',
            title: 'Ask the partner to confirm',
            subtitle:
                'This sends a booking request lead. Payments are not enabled in this MVP.',
          ),
          TextField(
            name: 'RequestNameField',
            label: 'Name',
            onChanged: SetState('contactName', const TextValue()),
          ),
          TextField(
            name: 'RequestEmailField',
            label: 'Email',
            keyboard: Keyboard.email,
            onChanged: SetState('contactEmail', const TextValue()),
          ),
          TextField(
            name: 'PartySizeField',
            label: 'Party size',
            keyboard: Keyboard.number,
            onChanged: SetState('partySize', const TextValue().asInt()),
          ),
          TextField(
            name: 'RequestMessageField',
            label: 'Message',
            maxLines: 4,
            onChanged: SetState('message', const TextValue()),
          ),
          Button(
            'Send Booking Request',
            name: 'SendBookingRequestButton',
            width: double.infinity,
            height: 48,
            icon: 'send',
            borderRadius: 8,
            onTap: [
              If(
                const Global(GlobalProperty.isUserLoggedIn),
                then: [
                  FirestoreCreate(
                    bookingRequests,
                    fields: {
                      'userId': const AuthUser(AuthUserField.userId),
                      'listingRef': PageParam('listingRef'),
                      'listingTitle': State('listing')['title'],
                      'contactName': State('contactName'),
                      'contactEmail': State('contactEmail'),
                      'partySize': State('partySize'),
                      'message': State('message'),
                      'status': 'new',
                      'createdAt': const Global(
                        GlobalProperty.currentTimestamp,
                      ),
                    },
                    outputAs: 'bookingRequest',
                  ),
                  Snackbar('Booking request sent.'),
                ],
                orElse: [
                  Snackbar('Sign in to send booking requests.'),
                  Navigate.to(signInPage),
                ],
              ),
            ],
          ),
        ],
      ),
    ),
  );

  app.page(
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

  final homePage = app.page(
    'DiscoverPage',
    route: '/',
    state: {'featuredDeals': listOf(listings)},
    onLoad: [SetState.clear('featuredDeals')],
    body: Scaffold(
      appBar: AppBar(title: 'GoFunMotion'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 20,
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            borderRadius: 8,
            gradient: Gradient.linear([
              GradientStop(Colors.accent1, 0),
              GradientStop(Colors.secondaryBackground, 1),
            ], angle: 24),
            child: Column(
              crossAxis: CrossAxis.start,
              spacing: 14,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  borderRadius: 8,
                  color: Colors.primary,
                  child: Text(
                    'GoFunMotion Deals',
                    style: Styles.labelMedium,
                    color: Colors.primaryBackground,
                  ),
                ),
                Text(
                  'Find something fun to do today.',
                  style: Styles.headlineMedium,
                  maxLines: 3,
                ),
                Text(
                  'Local activity deals, date night ideas, family plans, group-friendly picks, and partner booking requests in one simple app.',
                  style: Styles.bodyLarge,
                  color: Colors.secondaryText,
                ),
                Row(
                  spacing: 10,
                  children: [
                    Expanded(
                      Button(
                        'Find My Plan',
                        name: 'HeroFindPlanButton',
                        height: 48,
                        icon: 'travel_explore',
                        borderRadius: 8,
                        onTap: Navigate('FindPlanPage'),
                      ),
                    ),
                    IconButton(
                      'bookmark',
                      name: 'HeroSavedButton',
                      size: 48,
                      fillColor: Colors.secondaryBackground,
                      color: Colors.primary,
                      borderRadius: 8,
                      onTap: Navigate('SavedPage'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Row(
            spacing: 8,
            scrollable: true,
            children: [
              Chip('Tonight', icon: 'nightlife', selected: true),
              Chip('Date night', icon: 'favorite'),
              Chip('Friends', icon: 'groups'),
              Chip('Family', icon: 'family_restroom'),
              Chip('Under \$50', icon: 'payments'),
            ],
          ),
          sectionHeader(
            eyebrow: 'Marketplace',
            title: 'Approved deals first',
            subtitle:
                'Public listings should come from approved partner records. Demo previews are clearly labeled while local content is being onboarded.',
          ),
          dealCard(
            title: 'Demo: Mini golf and late dessert route',
            businessName: 'Demo partner preview',
            category: 'Date Night',
            city: 'Los Angeles',
            neighborhood: 'Arts District',
            priceLabel: 'Under \$50',
            dealLabel: 'Preview',
            isDemo: true,
            onTapAction: Snackbar(
              'Demo preview. Add approved partner listings in Firestore.',
            ),
          ),
          dealCard(
            title: 'Demo: Family arcade hour with snacks',
            businessName: 'Demo partner preview',
            category: 'Family',
            city: 'Los Angeles',
            neighborhood: 'Westside',
            priceLabel: 'Under \$75',
            dealLabel: 'Preview',
            isDemo: true,
            onTapAction: Snackbar(
              'Demo preview. Add approved partner listings in Firestore.',
            ),
          ),
          sectionHeader(
            eyebrow: 'Firestore ready',
            title: 'Approved listings',
            subtitle:
                'Connect this list in FlutterFlow Builder with approved-only query filters before enabling live marketplace supply.',
          ),
          queryGuardNotice(
            title: 'Approved listings are ready for Builder filters',
            body:
                'Connect this list to listings where isApproved is true and status is published before enabling live marketplace supply.',
          ),
          ListView(
            name: 'HomeFeaturedDealsList',
            source: State('featuredDeals'),
            shrinkWrap: true,
            spacing: 12,
            itemBuilder:
                (item) => dealCard(
                  title: item['title'],
                  businessName: item['businessName'],
                  category: item['category'],
                  city: item['city'],
                  neighborhood: item['neighborhood'],
                  priceLabel: item['priceLabel'],
                  dealLabel: item['dealLabel'],
                  isDemo: item['isDemo'],
                  onTapAction: Navigate.to(
                    dealDetailPage,
                    params: {'listingRef': DocumentReferenceOf(item)},
                  ),
                ),
          ),
        ],
      ),
    ),
  );

  final findPlanPage = app.page(
    'FindPlanPage',
    route: '/find',
    state: {
      'city': string.withDefault('Los Angeles'),
      'persona': string.withDefault('Date Night'),
      'when': string.withDefault('Today'),
      'budget': string.withDefault('Under \$50'),
      'vibe': string.withDefault('Low key'),
      'planSummary': string.withDefault(
        'Start with one anchor activity, add a nearby food stop, then keep a backup deal ready in case timing changes.',
      ),
    },
    body: Scaffold(
      appBar: AppBar(title: 'Find My Plan'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 18,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Rule-based planner',
            title: 'Tell us the shape of the day',
            subtitle:
                'No paid AI or external APIs yet. This MVP uses Builder-native filters and Firestore-ready data.',
          ),
          TextField(
            name: 'PlanCityField',
            label: 'City',
            onChanged: [
              SetState('city', const TextValue()),
              UpdateAppState.set('activeCity', const TextValue()),
            ],
          ),
          Dropdown(
            name: 'PersonaDropdown',
            label: 'Who is going?',
            value: State('persona'),
            options: const [
              'Date Night',
              'Friends',
              'Family',
              'Solo',
              'Visitors',
            ],
            onChanged: [
              SetState('persona', const WidgetValue()),
              UpdateAppState.set('planPersona', const WidgetValue()),
            ],
          ),
          Dropdown(
            name: 'WhenDropdown',
            label: 'When?',
            value: State('when'),
            options: const ['Today', 'Tonight', 'Tomorrow', 'This weekend'],
            onChanged: SetState('when', const WidgetValue()),
          ),
          Dropdown(
            name: 'BudgetDropdown',
            label: 'Budget',
            value: State('budget'),
            options: const [
              'Free',
              'Under \$25',
              'Under \$50',
              'Under \$100',
              'Flexible',
            ],
            onChanged: SetState('budget', const WidgetValue()),
          ),
          Dropdown(
            name: 'VibeDropdown',
            label: 'Vibe',
            value: State('vibe'),
            options: const [
              'Low key',
              'Active',
              'Romantic',
              'Kid-friendly',
              'Food first',
            ],
            onChanged: SetState('vibe', const WidgetValue()),
          ),
          Button(
            'Find My Plan',
            name: 'FindMyPlanButton',
            width: double.infinity,
            height: 50,
            icon: 'auto_awesome',
            borderRadius: 8,
            onTap: Snackbar(
              'Plan updated from your filters. Connect approved listings as supply grows.',
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            borderRadius: 8,
            color: Colors.secondaryBackground,
            borderColor: Colors.alternate,
            borderWidth: 1,
            child: Column(
              crossAxis: CrossAxis.start,
              spacing: 12,
              children: [
                Text('Suggested plan', style: Styles.titleLarge),
                Text(
                  State('planSummary'),
                  style: Styles.bodyMedium,
                  color: Colors.secondaryText,
                ),
                planStepCard(
                  icon: 'local_activity',
                  title: 'Anchor activity',
                  subtitle:
                      'Pick one approved activity deal that matches your group.',
                  meta: 'Best for selected persona',
                ),
                planStepCard(
                  icon: 'restaurant',
                  title: 'Nearby add-on',
                  subtitle:
                      'Leave space for food, coffee, dessert, or a walkable stop.',
                  meta: 'Keeps the plan flexible',
                ),
                planStepCard(
                  icon: 'bookmark_added',
                  title: 'Backup option',
                  subtitle:
                      'Save one alternate deal for weather, timing, or group changes.',
                  meta: 'Reduces planning friction',
                ),
                Button(
                  'Save Plan',
                  name: 'SavePlanButton',
                  width: double.infinity,
                  height: 46,
                  icon: 'bookmark_add',
                  borderRadius: 8,
                  onTap: [
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
                            'createdAt': const Global(
                              GlobalProperty.currentTimestamp,
                            ),
                          },
                          outputAs: 'savedPlan',
                        ),
                        Snackbar('Plan saved.'),
                      ],
                      orElse: [
                        Snackbar('Sign in to save plans.'),
                        Navigate.to(signInPage),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );

  final dealsPage = app.page(
    'DealsPage',
    route: '/deals',
    state: {
      'city': string.withDefault('Los Angeles'),
      'category': string.withDefault('All'),
      'deals': listOf(listings),
    },
    onLoad: [SetState.clear('deals')],
    body: Scaffold(
      appBar: AppBar(title: 'Deals'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Local discovery',
            title: 'Activity deals',
            subtitle:
                'Browse first. Sign in only when saving a deal or sending a booking request.',
          ),
          TextField(
            name: 'DealsCityField',
            label: 'City',
            onChanged: SetState('city', const TextValue()),
          ),
          Dropdown(
            name: 'DealsCategoryDropdown',
            label: 'Category',
            value: State('category'),
            options: const [
              'All',
              'Date Night',
              'Friends',
              'Family',
              'Food',
              'Outdoors',
              'Classes',
            ],
            onChanged: SetState('category', const WidgetValue()),
          ),
          Row(
            spacing: 8,
            scrollable: true,
            children: [
              Chip('Last-minute', icon: 'bolt', selected: true),
              Chip('Request booking', icon: 'event'),
              Chip('Approved', icon: 'verified'),
              Chip('No checkout', icon: 'lock_open'),
            ],
          ),
          queryGuardNotice(
            title: 'Live deals need approved-only filters',
            body:
                'Keep browsing public. Wire this list to approved listings only, then layer city and category filters in Builder.',
          ),
          ListView(
            name: 'DealsList',
            source: State('deals'),
            shrinkWrap: true,
            spacing: 12,
            itemBuilder:
                (item) => dealCard(
                  title: item['title'],
                  businessName: item['businessName'],
                  category: item['category'],
                  city: item['city'],
                  neighborhood: item['neighborhood'],
                  priceLabel: item['priceLabel'],
                  dealLabel: item['dealLabel'],
                  isDemo: item['isDemo'],
                  onTapAction: Navigate.to(
                    dealDetailPage,
                    params: {'listingRef': DocumentReferenceOf(item)},
                  ),
                ),
          ),
          emptyState(
            icon: 'add_business',
            title: 'Need more local supply?',
            body:
                'Invite businesses to apply. Listings become public only after admin approval.',
            buttonLabel: 'Partner With Us',
            onTapAction: Navigate('PartnerApplyPage'),
          ),
        ],
      ),
    ),
  );

  final savedPage = app.page(
    'SavedPage',
    route: '/saved',
    state: {
      'savedDeals': listOf(savedListings),
      'savedPlanItems': listOf(savedPlans),
    },
    onLoad: [SetState.clear('savedDeals'), SetState.clear('savedPlanItems')],
    body: Scaffold(
      appBar: AppBar(title: 'Saved'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Your shortlist',
            title: 'Saved plans and deals',
            subtitle:
                'Saves require sign-in so users can return across devices.',
          ),
          Container(
            visible: Not(const Global(GlobalProperty.isUserLoggedIn)),
            padding: const EdgeInsets.all(16),
            borderRadius: 8,
            color: Colors.accent1,
            child: Column(
              crossAxis: CrossAxis.start,
              spacing: 10,
              children: [
                Text('Sign in required', style: Styles.titleMedium),
                Text(
                  'Create an account to save plans, deals, and booking requests.',
                  style: Styles.bodyMedium,
                  color: Colors.secondaryText,
                ),
                Button(
                  'Sign In',
                  icon: 'login',
                  borderRadius: 8,
                  onTap: Navigate.to(signInPage),
                ),
              ],
            ),
          ),
          queryGuardNotice(
            title: 'Saved lists need user-scoped filters',
            body:
                'Connect saved plans and saved deals to records owned by the signed-in user before showing cross-device saves.',
            visible: const Global(GlobalProperty.isUserLoggedIn),
          ),
          ListView(
            name: 'SavedPlansList',
            source: State('savedPlanItems'),
            shrinkWrap: true,
            spacing: 10,
            visible: const Global(GlobalProperty.isUserLoggedIn),
            itemBuilder:
                (item) => Container(
                  padding: const EdgeInsets.all(14),
                  borderRadius: 8,
                  color: Colors.secondaryBackground,
                  borderColor: Colors.alternate,
                  borderWidth: 1,
                  child: Column(
                    crossAxis: CrossAxis.start,
                    spacing: 6,
                    children: [
                      Text(item['persona'], style: Styles.titleMedium),
                      Text(item['summary'], style: Styles.bodyMedium),
                      Text(
                        item['city'],
                        style: Styles.labelSmall,
                        color: Colors.primary,
                      ),
                    ],
                  ),
                ),
          ),
          ListView(
            name: 'SavedDealsList',
            source: State('savedDeals'),
            shrinkWrap: true,
            spacing: 10,
            visible: const Global(GlobalProperty.isUserLoggedIn),
            itemBuilder:
                (item) => Container(
                  padding: const EdgeInsets.all(14),
                  borderRadius: 8,
                  color: Colors.secondaryBackground,
                  borderColor: Colors.alternate,
                  borderWidth: 1,
                  child: Column(
                    crossAxis: CrossAxis.start,
                    spacing: 6,
                    children: [
                      Text(item['listingTitle'], style: Styles.titleMedium),
                      Text(
                        item['city'],
                        style: Styles.bodySmall,
                        color: Colors.secondaryText,
                      ),
                    ],
                  ),
                ),
          ),
        ],
      ),
    ),
  );

  final profilePage = app.page(
    'ProfilePage',
    route: '/profile',
    body: Scaffold(
      appBar: AppBar(title: 'Profile'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            visible: Not(const Global(GlobalProperty.isUserLoggedIn)),
            child: emptyState(
              icon: 'person',
              title: 'Create your planning profile',
              body:
                  'Sign in to save deals, keep booking requests, and manage preferences.',
              buttonLabel: 'Sign In',
              onTapAction: Navigate.to(signInPage),
            ),
          ),
          Container(
            visible: const Global(GlobalProperty.isUserLoggedIn),
            padding: const EdgeInsets.all(18),
            borderRadius: 8,
            color: Colors.secondaryBackground,
            borderColor: Colors.alternate,
            borderWidth: 1,
            child: Column(
              crossAxis: CrossAxis.start,
              spacing: 12,
              children: [
                Row(
                  spacing: 12,
                  children: [
                    Avatar(
                      text: const AuthUser(AuthUserField.displayName),
                      size: 52,
                      backgroundColor: Colors.accent2,
                      textColor: Colors.secondary,
                    ),
                    Expanded(
                      Column(
                        crossAxis: CrossAxis.start,
                        spacing: 4,
                        children: [
                          Text(
                            const AuthUser(AuthUserField.displayName),
                            style: Styles.titleMedium,
                          ),
                          Text(
                            const AuthUser(AuthUserField.email),
                            style: Styles.bodySmall,
                            color: Colors.secondaryText,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Divider(),
                Text('Preferences', style: Styles.titleSmall),
                Text(
                  AppState('activeCity'),
                  style: Styles.bodyMedium,
                  color: Colors.secondaryText,
                ),
                Text(
                  AppState('planPersona'),
                  style: Styles.bodyMedium,
                  color: Colors.secondaryText,
                ),
                Button(
                  'Partner Dashboard',
                  icon: 'storefront',
                  variant: ButtonVariant.outlined,
                  width: double.infinity,
                  borderRadius: 8,
                  onTap: Navigate('PartnerDashboardPage'),
                ),
                Button(
                  'Logout',
                  icon: 'logout',
                  variant: ButtonVariant.text,
                  width: double.infinity,
                  onTap: const [Logout()],
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );

  final partnerPage = app.page(
    'PartnerPage',
    route: '/partner',
    body: Scaffold(
      appBar: AppBar(title: 'Partners'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Business tools',
            title: 'Bring local deals to GoFunMotion',
            subtitle:
                'Partners submit listings, admins approve them, and customers request bookings without checkout in this MVP.',
          ),
          planStepCard(
            icon: 'edit_note',
            title: 'Apply',
            subtitle:
                'Tell us the business, category, city, and ideal customer.',
            meta: 'Open application',
          ),
          planStepCard(
            icon: 'fact_check',
            title: 'Approval',
            subtitle:
                'Admins review business and listing quality before public visibility.',
            meta: 'Required before listing',
          ),
          planStepCard(
            icon: 'dashboard',
            title: 'Dashboard',
            subtitle:
                'Approved partners manage listing drafts and booking requests.',
            meta: 'Sign-in required',
          ),
          Button(
            'Apply as Partner',
            width: double.infinity,
            height: 48,
            icon: 'add_business',
            borderRadius: 8,
            onTap: Navigate('PartnerApplyPage'),
          ),
          Button(
            'Open Dashboard',
            width: double.infinity,
            height: 48,
            icon: 'dashboard',
            variant: ButtonVariant.outlined,
            borderRadius: 8,
            onTap: Navigate('PartnerDashboardPage'),
          ),
        ],
      ),
    ),
  );

  final partnerApplyPage = app.page(
    'PartnerApplyPage',
    route: '/partner/apply',
    state: {
      'businessName': string,
      'contactName': string,
      'contactEmail': string,
      'city': string.withDefault('Los Angeles'),
      'category': string.withDefault('Activity'),
      'description': string,
    },
    body: Scaffold(
      appBar: AppBar(title: 'Partner application'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 14,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Approval required',
            title: 'Apply to list deals',
            subtitle:
                'Submissions are stored for admin review before any public listing goes live.',
          ),
          TextField(
            label: 'Business name',
            onChanged: SetState('businessName', const TextValue()),
          ),
          TextField(
            label: 'Contact name',
            onChanged: SetState('contactName', const TextValue()),
          ),
          TextField(
            label: 'Contact email',
            keyboard: Keyboard.email,
            onChanged: SetState('contactEmail', const TextValue()),
          ),
          TextField(
            label: 'City',
            onChanged: SetState('city', const TextValue()),
          ),
          Dropdown(
            label: 'Category',
            value: State('category'),
            options: const [
              'Activity',
              'Food',
              'Wellness',
              'Classes',
              'Outdoors',
              'Family',
              'Nightlife',
            ],
            onChanged: SetState('category', const WidgetValue()),
          ),
          TextField(
            label: 'What deal would you offer?',
            maxLines: 5,
            onChanged: SetState('description', const TextValue()),
          ),
          Button(
            'Submit Application',
            width: double.infinity,
            height: 48,
            icon: 'send',
            borderRadius: 8,
            onTap: [
              FirestoreCreate(
                partnerApplications,
                fields: {
                  'businessName': State('businessName'),
                  'contactName': State('contactName'),
                  'contactEmail': State('contactEmail'),
                  'city': State('city'),
                  'category': State('category'),
                  'description': State('description'),
                  'status': 'pending',
                  'createdAt': const Global(GlobalProperty.currentTimestamp),
                },
                outputAs: 'partnerApplication',
              ),
              Snackbar('Application submitted for review.'),
              Navigate('PartnerPage'),
            ],
          ),
        ],
      ),
    ),
  );

  final partnerDashboardPage = app.page(
    'PartnerDashboardPage',
    route: '/partner/dashboard',
    body: Scaffold(
      appBar: AppBar(title: 'Partner dashboard'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            visible: Not(const Global(GlobalProperty.isUserLoggedIn)),
            child: emptyState(
              icon: 'lock',
              title: 'Sign in for partner tools',
              body:
                  'Partner dashboard access requires authentication and role-based Firebase rules.',
              buttonLabel: 'Sign In',
              onTapAction: Navigate.to(signInPage),
            ),
          ),
          Container(
            visible: const Global(GlobalProperty.isUserLoggedIn),
            child: Column(
              crossAxis: CrossAxis.start,
              spacing: 16,
              children: [
                sectionHeader(
                  eyebrow: 'Partner workspace',
                  title: 'Manage deal supply',
                  subtitle:
                      'Create listing drafts in Builder, then rely on admin approval before public visibility.',
                ),
                Row(
                  spacing: 10,
                  children: [
                    Expanded(
                      Container(
                        padding: const EdgeInsets.all(14),
                        borderRadius: 8,
                        color: Colors.secondaryBackground,
                        borderColor: Colors.alternate,
                        borderWidth: 1,
                        child: Column(
                          crossAxis: CrossAxis.start,
                          spacing: 4,
                          children: [
                            Text('0', style: Styles.titleLarge),
                            Text(
                              'Pending listings',
                              style: Styles.bodySmall,
                              color: Colors.secondaryText,
                            ),
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      Container(
                        padding: const EdgeInsets.all(14),
                        borderRadius: 8,
                        color: Colors.secondaryBackground,
                        borderColor: Colors.alternate,
                        borderWidth: 1,
                        child: Column(
                          crossAxis: CrossAxis.start,
                          spacing: 4,
                          children: [
                            Text('0', style: Styles.titleLarge),
                            Text(
                              'Booking requests',
                              style: Styles.bodySmall,
                              color: Colors.secondaryText,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                Row(
                  spacing: 10,
                  children: [
                    Expanded(
                      Container(
                        padding: const EdgeInsets.all(14),
                        borderRadius: 8,
                        color: Colors.secondaryBackground,
                        borderColor: Colors.alternate,
                        borderWidth: 1,
                        child: Column(
                          crossAxis: CrossAxis.start,
                          spacing: 4,
                          children: [
                            Text('0', style: Styles.titleLarge),
                            Text(
                              'Approved deals',
                              style: Styles.bodySmall,
                              color: Colors.secondaryText,
                            ),
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      Container(
                        padding: const EdgeInsets.all(14),
                        borderRadius: 8,
                        color: Colors.secondaryBackground,
                        borderColor: Colors.alternate,
                        borderWidth: 1,
                        child: Column(
                          crossAxis: CrossAxis.start,
                          spacing: 4,
                          children: [
                            Text('0', style: Styles.titleLarge),
                            Text(
                              'Messages',
                              style: Styles.bodySmall,
                              color: Colors.secondaryText,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                Button(
                  'Request Listing Setup',
                  width: double.infinity,
                  height: 48,
                  icon: 'add_circle',
                  borderRadius: 8,
                  onTap: SendEmail(
                    Constant('supportEmail'),
                    subject: 'GoFunMotion listing setup',
                    body:
                        'Please help me set up a GoFunMotion partner listing.',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );

  final adminPage = app.page(
    'AdminPage',
    route: '/admin',
    state: {
      'applications': listOf(partnerApplications),
      'adminListings': listOf(listings),
    },
    onLoad: [
      FirestoreQuery(partnerApplications, limit: 25, outputAs: 'adminApps'),
      SetState('applications', const ActionOutput('adminApps')),
      FirestoreQuery(listings, limit: 25, outputAs: 'adminListingsQuery'),
      SetState('adminListings', const ActionOutput('adminListingsQuery')),
    ],
    body: Scaffold(
      appBar: AppBar(title: 'Admin'),
      body: Column(
        scrollable: true,
        crossAxis: CrossAxis.start,
        spacing: 16,
        padding: const EdgeInsets.all(20),
        children: [
          sectionHeader(
            eyebrow: 'Approval queue',
            title: 'Review supply before public visibility',
            subtitle:
                'Protect this route with Firebase admin role rules before production.',
          ),
          Container(
            visible: Not(const Global(GlobalProperty.isUserLoggedIn)),
            child: emptyState(
              icon: 'admin_panel_settings',
              title: 'Admin sign-in required',
              body:
                  'Admin access should be limited by Firestore custom claims or role documents.',
              buttonLabel: 'Sign In',
              onTapAction: Navigate.to(signInPage),
            ),
          ),
          ListView(
            name: 'AdminApplicationsList',
            source: State('applications'),
            shrinkWrap: true,
            spacing: 10,
            visible: const Global(GlobalProperty.isUserLoggedIn),
            itemBuilder:
                (item) => Container(
                  padding: const EdgeInsets.all(14),
                  borderRadius: 8,
                  color: Colors.secondaryBackground,
                  borderColor: Colors.alternate,
                  borderWidth: 1,
                  child: Column(
                    crossAxis: CrossAxis.start,
                    spacing: 8,
                    children: [
                      Text(item['businessName'], style: Styles.titleMedium),
                      Text(item['contactEmail'], style: Styles.bodySmall),
                      Text(item['description'], style: Styles.bodyMedium),
                      Row(
                        spacing: 8,
                        children: [
                          Button(
                            'Approve',
                            icon: 'check',
                            borderRadius: 8,
                            onTap: [
                              FirestoreUpdate(
                                DocumentReferenceOf(item),
                                collection: partnerApplications,
                                fields: {'status': 'approved'},
                              ),
                              Snackbar('Application marked approved.'),
                            ],
                          ),
                          Button(
                            'Needs Info',
                            variant: ButtonVariant.outlined,
                            icon: 'help',
                            borderRadius: 8,
                            onTap: [
                              FirestoreUpdate(
                                DocumentReferenceOf(item),
                                collection: partnerApplications,
                                fields: {'status': 'needs_info'},
                              ),
                              Snackbar('Application marked needs info.'),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
          ),
          sectionHeader(
            eyebrow: 'Listings',
            title: 'Public listing controls',
            subtitle:
                'Only approved listing documents should be visible in customer-facing queries.',
          ),
          ListView(
            name: 'AdminListingsList',
            source: State('adminListings'),
            shrinkWrap: true,
            spacing: 10,
            visible: const Global(GlobalProperty.isUserLoggedIn),
            itemBuilder:
                (item) => Container(
                  padding: const EdgeInsets.all(14),
                  borderRadius: 8,
                  color: Colors.secondaryBackground,
                  borderColor: Colors.alternate,
                  borderWidth: 1,
                  child: Column(
                    crossAxis: CrossAxis.start,
                    spacing: 8,
                    children: [
                      Text(item['title'], style: Styles.titleMedium),
                      Text(item['businessName'], style: Styles.bodySmall),
                      Row(
                        spacing: 8,
                        children: [
                          Button(
                            'Publish',
                            icon: 'verified',
                            borderRadius: 8,
                            onTap: [
                              FirestoreUpdate(
                                DocumentReferenceOf(item),
                                collection: listings,
                                fields: {
                                  'status': 'approved',
                                  'isApproved': true,
                                  'updatedAt': const Global(
                                    GlobalProperty.currentTimestamp,
                                  ),
                                },
                              ),
                              Snackbar('Listing approved.'),
                            ],
                          ),
                          Button(
                            'Hide',
                            variant: ButtonVariant.outlined,
                            icon: 'visibility_off',
                            borderRadius: 8,
                            onTap: [
                              FirestoreUpdate(
                                DocumentReferenceOf(item),
                                collection: listings,
                                fields: {
                                  'status': 'hidden',
                                  'isApproved': false,
                                  'updatedAt': const Global(
                                    GlobalProperty.currentTimestamp,
                                  ),
                                },
                              ),
                              Snackbar('Listing hidden.'),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
          ),
        ],
      ),
    ),
  );

  app.bottomNav(
    items: [
      BottomNavItem(homePage, icon: 'home'),
      BottomNavItem(findPlanPage, icon: 'travel_explore'),
      BottomNavItem(dealsPage, icon: 'local_offer'),
      BottomNavItem(savedPage, icon: 'bookmark'),
      BottomNavItem(profilePage, icon: 'person'),
    ],
    style: BottomNavStyle.floating,
    backgroundColor: Colors.secondaryBackground,
    selectedColor: Colors.primary,
    unselectedColor: Colors.secondaryText,
  );

  app.firebaseAuth(
    providers: const [
      FirebaseAuthProvider.email,
      FirebaseAuthProvider.google,
      FirebaseAuthProvider.apple,
      FirebaseAuthProvider.anonymous,
    ],
    homePage: homePage,
    signInPage: signInPage,
    autoCreateUserDocument: true,
    userCollectionName: users.name,
  );

  app.constant(
    'builderFirstScope',
    'All GoFunMotion screens are native FlutterFlow widgets, native actions, page state, app state, Firebase Auth, and Firestore collections. No custom widgets, custom actions, custom functions, paid APIs, or checkout code are declared in this DSL.',
  );

  // These handles are intentionally referenced so static analysis keeps route
  // declarations visible when future edits add drawer or role-based routing.
  partnerPage.name;
  partnerApplyPage.name;
  partnerDashboardPage.name;
  adminPage.name;
  waitlistPage.name;
  cities.name;
  categories.name;
  bookingRequests.name;
  waitlist.name;
}

void _configureBrandAssets(App app) {
  app.raw((project) {
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

void _configureDesignSystem(App app) {
  app.darkMode(enabled: true);
  app.primaryFont('Inter');

  app.themeColor('primary', 0xFF0F766E, dark: 0xFF2DD4BF);
  app.themeColor('secondary', 0xFFEA580C, dark: 0xFFF97316);
  app.themeColor('tertiary', 0xFF2563EB, dark: 0xFF60A5FA);
  app.themeColor('alternate', 0xFFE5E7EB, dark: 0xFF334155);
  app.themeColor('primaryBackground', 0xFFF8FAFC, dark: 0xFF09111F);
  app.themeColor('secondaryBackground', 0xFFFFFFFF, dark: 0xFF111827);
  app.themeColor('primaryText', 0xFF101827, dark: 0xFFF8FAFC);
  app.themeColor('secondaryText', 0xFF64748B, dark: 0xFFCBD5E1);
  app.themeColor('accent1', 0xFFE0F2FE, dark: 0xFF0F2D3F);
  app.themeColor('accent2', 0xFFFFEDD5, dark: 0xFF3B2414);
  app.themeColor('accent3', 0xFFDCFCE7, dark: 0xFF123524);
  app.themeColor('accent4', 0xFFF5F3FF, dark: 0xFF241A3E);
  app.themeColor('success', 0xFF16A34A, dark: 0xFF4ADE80);
  app.themeColor('warning', 0xFFF59E0B, dark: 0xFFFBBF24);
  app.themeColor('error', 0xFFDC2626, dark: 0xFFF87171);
  app.themeColor('info', 0xFF2563EB, dark: 0xFF60A5FA);

  app.typography(
    'headlineMedium',
    fontFamily: 'Inter',
    fontSize: 36,
    fontWeight: 800,
    color: 0xFF101827,
  );
  app.typography(
    'headlineSmall',
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: 800,
    color: 0xFF101827,
  );
  app.typography(
    'titleLarge',
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: 700,
    color: 0xFF101827,
  );
  app.typography(
    'titleMedium',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: 700,
    color: 0xFF101827,
  );
  app.typography(
    'titleSmall',
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 700,
    color: 0xFF101827,
  );
  app.typography(
    'bodyLarge',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 500,
    color: 0xFF334155,
  );
  app.typography(
    'bodyMedium',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 500,
    color: 0xFF475569,
  );
  app.typography(
    'bodySmall',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 500,
    color: 0xFF64748B,
  );
  app.typography(
    'labelMedium',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 800,
    color: 0xFF0F766E,
  );
  app.typography(
    'labelSmall',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: 700,
    color: 0xFF64748B,
  );

  app.spacingToken('pagePadding', 20);
  app.spacingToken('sectionGap', 18);
  app.spacingToken('cardPadding', 16);
}
