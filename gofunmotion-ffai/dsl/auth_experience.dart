import 'package:flutterflow_ai/flutterflow_ai.dart';
import '../lib/flutterflow_project.dart' as ff;

void ensureNativeAccountEntry(App app) {
  // configureFirebaseAuth(false) does not clear a previously enabled setting.
  app.raw(
    (project) => project.authentication.firebase.clearCreateUserDocument(),
  );
  final response = app.struct('MobileAccountSyncResponse', {
    'synced': bool_,
    'role': string,
  });
  final sync = Endpoint.post(
    'SyncMobileAccount',
    '/api/account/profile/sync',
    variables: {'token': string},
    headers: const {'Authorization': 'Bearer [token]'},
    settings: const EndpointSettings(requireAuthentication: true),
    response: response,
  );
  app.apiGroup(
    'GoFunMotionAccount',
    baseUrl: 'https://gofunmotion.com',
    headers: const {'Accept': 'application/json'},
    endpoints: [sync],
  );

  // Native auth must not create FlutterFlow's snake_case user document.
  // The authenticated web endpoint owns the shared marketplace profile schema.
  app.editPage(ff.Pages.signInPage, (page) {
    final signIn = ff.Pages.signInPage;
    page.ensureActions(
      signIn.widgets.root,
      triggerType: FFActionTriggerType.ON_INIT_STATE,
      actions: [
        If(
          const Global(GlobalProperty.isUserLoggedIn),
          then: [
            Navigate(
              ff.Pages.profilePage,
              allowBack: false,
              replaceRoute: true,
            ),
          ],
        ),
      ],
    );
    final authActions = <String, DslAction>{
      'SignInButton': LoginEmailPassword(
        WidgetState('EmailField', WidgetStateProperty.text),
        WidgetState('PasswordField', WidgetStateProperty.text),
      ),
      'CreateAccountButton': SignupEmailPassword(
        WidgetState('EmailField', WidgetStateProperty.text),
        WidgetState('PasswordField', WidgetStateProperty.text),
        confirmPassword: WidgetState('PasswordField', WidgetStateProperty.text),
      ),
      'GoogleSignInButton': const LoginWithGoogle(),
      'AppleSignInButton': const LoginWithApple(),
    };
    for (final entry in authActions.entries) {
      page.ensureActions(
        signIn.widgets.all.singleWhere((widget) => widget.name == entry.key),
        triggerType: FFActionTriggerType.ON_TAP,
        actions: [
          entry.value,
          ApiCall(
            sync,
            outputAs: '${entry.key}Sync',
            params: {'token': const AuthUser(AuthUserField.jwtToken)},
            onSuccess:
                (_) => [
                  Navigate(
                    ff.Pages.profilePage,
                    allowBack: false,
                    replaceRoute: true,
                  ),
                ],
            onFailure: [
              Snackbar(
                'Signed in. Account details could not sync yet; try again from your profile.',
              ),
              Navigate(
                ff.Pages.profilePage,
                allowBack: false,
                replaceRoute: true,
              ),
            ],
          ),
        ],
      );
    }
    page.ensureReplaced(
      signIn.widgets.all.singleWhere(
        (widget) => widget.name == 'GuestSignInButton',
      ),
      Button(
        'Browse without an account',
        name: 'GuestSignInButton',
        height: 48,
        width: double.infinity,
        variant: ButtonVariant.text,
        textColor: Colors.primaryText,
        icon: 'explore_outlined',
        onTap: Navigate(
          ff.Pages.discoverPage,
          allowBack: false,
          replaceRoute: true,
        ),
      ),
    );
  });
  app.editPage(ff.Pages.profilePage, (page) {
    if (ff.Pages.profilePage.widgets.all.any(
      (widget) => widget.name == 'SyncAccountButton',
    ))
      return;
    page.ensureInsertedBefore(
      page.findByText('Logout'),
      Button(
        'Sync account',
        name: 'SyncAccountButton',
        icon: 'sync',
        height: 48,
        variant: ButtonVariant.text,
        textColor: Colors.primaryText,
        onTap: ApiCall(
          sync,
          outputAs: 'profileSync',
          params: {'token': const AuthUser(AuthUserField.jwtToken)},
          onSuccess: (_) => [Snackbar('Account details updated.')],
          onFailure: [Snackbar('Could not sync. Sign in again and retry.')],
        ),
      ),
    );
  });
}
