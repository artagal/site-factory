library;

import 'dart:io';

import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/pipeline/pipeline_source.dart'
    show PipelineSource;
import '../lib/flutterflow_project.dart' as ff;
import 'partner_deal_editor.dart';
import 'ai_experience.dart';
import 'auth_experience.dart';
import 'marketplace_experience.dart';
import 'expanded_workspace.dart';
import 'native_subscription.dart';
import 'package:flutterflow_ai/src/helpers/data_schema_helpers.dart'
    show
        addDataStructField,
        findDataStruct,
        findDataStructField,
        updateDataStructField;
import 'package:flutterflow_ai/src/helpers/data_type_helpers.dart' as ff_types;
import 'package:flutterflow_ai/src/helpers/ensure_helpers.dart'
    show ensureCollectionField;
import 'package:flutterflow_ai/src/helpers/project_helpers.dart'
    show setInitialPage;
import 'package:flutterflow_ai/src/helpers/theme_helpers.dart'
    show ffColor, ffThemeColor, getTypographyStyle, setTypographyStyle;
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import 'package:flutterflow_ai/src/helpers/variable_helpers.dart'
    show generatorVarField;
import 'package:protobuf/protobuf.dart' show GeneratedMessage;

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
      source: PipelineSource.paths([
        Platform.script.toFilePath(),
        Platform.script.resolve('partner_deal_editor.dart').toFilePath(),
        Platform.script.resolve('ai_experience.dart').toFilePath(),
        Platform.script.resolve('auth_experience.dart').toFilePath(),
        Platform.script.resolve('marketplace_experience.dart').toFilePath(),
        Platform.script.resolve('expanded_workspace.dart').toFilePath(),
        Platform.script.resolve('native_subscription.dart').toFilePath(),
      ]),
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
  final existingEditors =
      ff.Pages.all.where((page) => page.name == partnerDealEditorName).toList();
  final dealEditor = ensurePartnerDealEditor(
    app,
    existingPage: existingEditors.isEmpty ? null : existingEditors.single,
    saveListing: api.savePartnerListingV2,
    improveTitle: api.partnerCopyTitle,
    improveDescription: api.partnerCopyDescription,
    dashboard: ff.Pages.partnerDashboardPage,
    partnerListings: workspacePage('PartnerListingsPage'),
    signIn: ff.Pages.signInPage,
  );
  _wireAiAssistants(app, api, dealEditor);
  _wireCustomerBookingHistory(app, api);
  _wirePartnerDealWorkflow(app, api, dealEditor);
  final nativeAi = ensureNativeAiExperience(app);
  ensureNativeMarketplace(app, nativeAi);
  ensureNativeAccountEntry(
    app,
    onboardingPage: workspacePage('CustomerOnboardingPage'),
  );
  ensureExpandedWorkspace(app, nativeAi);
  _ensureAppearanceControls(app);
  ensureNativeSubscription(app);
  _ensureNativeVisualSystem(app);
  if (existingEditors.isNotEmpty) {
    ensurePartnerDealReuseCard(
      app,
      existingEditors.single,
      workspacePage('PartnerListingsPage'),
    );
  }
  app.raw(disableNativeAuthAutoNavigation);
  app.raw(verifyPartnerDealScreenStructure);
}

void verifyPartnerDealScreenStructure(FFProject project) {
  final dashboard = findPage(project, name: 'PartnerDashboardPage')!;
  for (final name in [
    'PartnerListingsPanel',
    'PartnerBookingInboxPanel',
    'CreateLastMinuteDealButton',
    'RefreshPartnerListingsButton',
  ]) {
    final matches = findDescendants(
      dashboard.node,
      (node) => node.name == name,
    );
    if (matches.length != 1) {
      throw StateError('Expected one $name, found ${matches.length}.');
    }
  }
  if (findDescendants(
    dashboard.node,
    (node) => node.name == 'PartnerDealFactsPanel',
  ).isNotEmpty) {
    throw StateError('The create-only form must not remain in the dashboard.');
  }
}

void _alignDealFirstDiscovery(App app) {
  app.editPage(ff.Pages.discoverPage, (page) {
    final existingHeader =
        ff.Pages.discoverPage.widgets.all
            .where((widget) => widget.name == 'DealFirstDiscoveryHeader')
            .toList();
    page.ensureReplaced(
      existingHeader.isEmpty
          ? ff.Pages.discoverPage.widgets.byKey('Container_5si7c46x').single
          : existingHeader.single,
      Column(
        name: 'DealFirstDiscoveryHeader',
        crossAxis: CrossAxis.start,
        spacing: 10,
        children: [
          Text(
            'GoFunMotion Deals',
            name: 'DealFirstDiscoveryEyebrow',
            style: Styles.labelMedium,
            color: Colors.tertiary,
          ),
          Text(
            'Last-minute fun deals near you.',
            name: 'DealFirstDiscoveryTitle',
            style: Styles.headlineMedium,
            maxLines: 3,
          ),
          Text(
            'Save on activities, date nights, and family fun with open spots today.',
            name: 'DealFirstDiscoverySubtitle',
            style: Styles.bodyLarge,
            color: Colors.secondaryText,
          ),
          Row(
            spacing: 8,
            children: [
              const Icon(
                'verified_outlined',
                size: 18,
                color: Colors.secondary,
              ),
              Expanded(
                Text(
                  'Reviewed offers. No payment until the business confirms.',
                  style: Styles.bodySmall,
                  color: Colors.secondaryText,
                  maxLines: 2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  });
  app.raw((project) {
    final discover = findPage(project, name: 'DiscoverPage');
    if (discover == null) return;
    final appBars = findDescendants(
      discover.node,
      (node) => node.type == FFWidgetType.AppBar,
    );
    if (appBars.length == 1) {
      appBars.single.props.appBar.centerTitleValue = FFBooleanValue(
        inputValue: false,
      );
      appBars.single.props.appBar.elevationValue = FFDoubleValue(inputValue: 0);
    }
  });
}

void _ensureGoFunMotionTheme(App app) {
  app.darkMode(enabled: true);
  app.primaryFont('Inter');
  app.secondaryFont('Inter');

  // Mirrors gofunmotion.com: neutral near-black marketplace surfaces, bright
  // lime actions and cyan information. Purple is intentionally not a surface.
  app.themeColor('primary', 0xFF3F7C16, dark: 0xFFBEF264);
  app.themeColor('secondary', 0xFF06748F, dark: 0xFF22D3EE);
  app.themeColor('tertiary', 0xFF5B8F20, dark: 0xFFBEF264);
  app.themeColor('alternate', 0xFFD8DEE8, dark: 0xFF2C3038);
  app.themeColor('primaryBackground', 0xFFF7FAF5, dark: 0xFF0B0D11);
  app.themeColor('secondaryBackground', 0xFFFFFFFF, dark: 0xFF16191F);
  app.themeColor('primaryText', 0xFF101828, dark: 0xFFFFFFFF);
  app.themeColor('secondaryText', 0xFF5F6673, dark: 0xFFB4BAC4);
  app.themeColor('accent1', 0xFFEEFAD7, dark: 0xFF243119);
  app.themeColor('accent2', 0xFFE5F8FC, dark: 0xFF123139);
  app.themeColor('accent3', 0xFFFEF3C7, dark: 0xFF3A2E12);
  app.themeColor('accent4', 0xFFEEF1F5, dark: 0xFF20242B);
  app.themeColor('success', 0xFF3F7C16, dark: 0xFFBEF264);
  app.themeColor('warning', 0xFF92400E, dark: 0xFFFCD34D);
  app.themeColor('error', 0xFFBE123C, dark: 0xFFFB7185);
  app.themeColor('info', 0xFF06748F, dark: 0xFF67E8F9);

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

void _ensureNativeVisualSystem(App app) {
  final menuSurface =
      ff.Components.workspaceMenuRow.widgets.all
          .where((widget) => widget.name == 'WorkspaceMenuRowSurface')
          .toList();
  final menuTarget =
      menuSurface.isNotEmpty
          ? menuSurface.single
          : ff.Components.workspaceMenuRow.widgets.all.singleWhere(
            (widget) =>
                widget.type == 'Container' &&
                widget.key != ff.Components.workspaceMenuRow.widgets.root.key,
          );
  app.editComponent(ff.Components.workspaceMenuRow, (component) {
    component.ensureReplaced(
      menuTarget,
      Container(
        name: 'WorkspaceMenuRowSurface',
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        borderRadius: 8,
        onTap: const ParamAction('onOpen'),
        child: Row(
          spacing: 12,
          children: [
            Container(
              width: 36,
              height: 36,
              borderRadius: 8,
              color: Colors.accent1,
              child: const Icon(
                'arrow_forward',
                size: 19,
                color: Colors.tertiary,
              ),
            ),
            Expanded(
              Column(
                crossAxis: CrossAxis.start,
                spacing: 3,
                children: [
                  Text(Param('label'), style: Styles.titleSmall, maxLines: 2),
                  Text(
                    Param('detail'),
                    style: Styles.bodySmall,
                    color: Colors.secondaryText,
                    maxLines: 2,
                    visible: Not(Equals(Param('detail'), '')),
                  ),
                ],
              ),
            ),
            const Icon('chevron_right', size: 22, color: Colors.secondaryText),
          ],
        ),
      ),
    );
  });
  final statusSurface =
      ff.Components.workspaceStatusBadge.widgets.all
          .where((widget) => widget.name == 'WorkspaceStatusBadgeSurface')
          .toList();
  final statusTarget =
      statusSurface.isNotEmpty
          ? statusSurface.single
          : ff.Components.workspaceStatusBadge.widgets.all.singleWhere(
            (widget) =>
                widget.type == 'Container' &&
                widget.key !=
                    ff.Components.workspaceStatusBadge.widgets.root.key,
          );
  app.editComponent(ff.Components.workspaceStatusBadge, (component) {
    component.ensureReplaced(
      statusTarget,
      Container(
        name: 'WorkspaceStatusBadgeSurface',
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        borderRadius: 8,
        color: Colors.accent1,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Text(
          Param('label'),
          style: Styles.labelMedium,
          color: Colors.tertiary,
          maxLines: 2,
        ),
      ),
    );
  });
  final emptySurface =
      ff.Components.workspaceEmptyState.widgets.all
          .where((widget) => widget.name == 'WorkspaceEmptyStateSurface')
          .toList();
  final emptyTarget =
      emptySurface.isNotEmpty
          ? emptySurface.single
          : ff.Components.workspaceEmptyState.widgets.all.singleWhere(
            (widget) => widget.type == 'Column',
          );
  app.editComponent(ff.Components.workspaceEmptyState, (component) {
    component.ensureReplaced(
      emptyTarget,
      Container(
        name: 'WorkspaceEmptyStateSurface',
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 10,
          children: [
            Container(
              width: 40,
              height: 40,
              borderRadius: 8,
              color: Colors.accent2,
              child: const Icon(
                'inbox_outlined',
                size: 22,
                color: Colors.secondary,
              ),
            ),
            Text(Param('label'), style: Styles.titleMedium, maxLines: 3),
          ],
        ),
      ),
    );
  });
  app.editPage(ff.Pages.discoverPage, (page) {
    final existingBrandTitle =
        ff.Pages.discoverPage.widgets.all
            .where((widget) => widget.name == 'GoFunMotionBrandTitle')
            .toList();
    page.ensureReplaced(
      existingBrandTitle.isNotEmpty
          ? existingBrandTitle.single
          : ff.Pages.discoverPage.widgets.all.singleWhere(
            (widget) => widget.name == 'AppBar Title',
          ),
      Row(
        name: 'GoFunMotionBrandTitle',
        spacing: 10,
        children: [
          Image(
            'https://gofunmotion.com/icons/gofunmotion-icon-512.png',
            width: 32,
            height: 32,
            fit: ImageFit.contain,
          ),
          Text('GoFunMotion', style: Styles.titleLarge),
        ],
      ),
    );
  });
  app.raw(_polishNativeVisualSystem);
}

void _polishNativeVisualSystem(FFProject project) {
  const rootPages = {
    'DiscoverPage',
    'FindPlanPage',
    'DealsPage',
    'SavedPage',
    'ProfilePage',
    'SplashPage',
  };
  for (final page in project.widgetClasses.values.where(
    (widgetClass) => widgetClass.node.type == FFWidgetType.Scaffold,
  )) {
    for (final appBar in _visualMessages(page.node).whereType<FFAppBar>()) {
      appBar.backgroundColorValue = FFColorValue(
        inputValue: ffThemeColor(FFColor_ThemeColor.PRIMARY_BACKGROUND),
      );
      appBar.backButtonColorValue = FFColorValue(
        inputValue: ffThemeColor(FFColor_ThemeColor.PRIMARY_TEXT),
      );
      appBar.elevationValue = FFDoubleValue(inputValue: 0);
      appBar.centerTitleValue = FFBooleanValue(inputValue: false);
      appBar.defaultBackButtonValue = FFBooleanValue(
        inputValue: !rootPages.contains(page.name),
      );
    }
    for (final button in _visualMessages(page.node).whereType<FFButton>()) {
      final fill = button.fillColorValue.inputValue.themeColor;
      if (fill == FFColor_ThemeColor.PRIMARY) {
        button.fillColorValue = FFColorValue(
          inputValue: ffThemeColor(FFColor_ThemeColor.TERTIARY),
        );
        button.text.colorValue = FFColorValue(inputValue: ffColor(0xFF101217));
        if (button.hasIconValue() && button.iconValue.hasInputValue()) {
          button.iconValue.inputValue.colorValue = FFColorValue(
            inputValue: ffColor(0xFF101217),
          );
        }
      }
      final height = button.ensureDimensions().ensureHeight();
      final currentHeight =
          height.hasPixelsValue() ? height.pixelsValue.inputValue : 0;
      if (currentHeight == 0 || currentHeight < 48) {
        height.pixelsValue = FFDoubleValue(inputValue: 48);
      }
      button.borderRadius = FFBorderRadius(
        type: FFBorderRadius_BorderRadiusType.FF_BORDER_RADIUS_ALL,
        allValue: FFDoubleValue(inputValue: 8),
      );
    }
    for (final field in _visualMessages(page.node).whereType<FFTextField>()) {
      final decoration = field.ensureInputDecoration();
      decoration.inputBorderType = FFInputDecoration_InputBorderType.outline;
      decoration.borderRadius = FFBorderRadius(
        type: FFBorderRadius_BorderRadiusType.FF_BORDER_RADIUS_ALL,
        allValue: FFDoubleValue(inputValue: 8),
      );
      decoration.filledValue = FFBooleanValue(inputValue: true);
      decoration.fillColorValue = FFColorValue(
        inputValue: ffThemeColor(FFColor_ThemeColor.SECONDARY_BACKGROUND),
      );
      decoration.borderColorValue = FFColorValue(
        inputValue: ffThemeColor(FFColor_ThemeColor.ALTERNATE),
      );
      decoration.focusBorderColorValue = FFColorValue(
        inputValue: ffThemeColor(FFColor_ThemeColor.SECONDARY),
      );
      decoration.errorBorderColorValue = FFColorValue(
        inputValue: ffThemeColor(FFColor_ThemeColor.ERROR),
      );
      decoration.borderWidthValue = FFDoubleValue(inputValue: 1);
    }
  }

  final signIn = findPage(project, name: 'SignInPage');
  if (signIn != null) {
    for (final entry
        in const {'Column_gubnb3sj': 18.0, 'Column_dgs7emev': 12.0}.entries) {
      final columns = findDescendants(
        signIn.node,
        (node) => node.key == entry.key,
      );
      if (columns.length == 1) {
        columns.single.props.column.listSpacing = FFListSpacing(
          spacingValue: FFDoubleValue(inputValue: entry.value),
        );
      }
    }
  }
}

Iterable<GeneratedMessage> _visualMessages(Object? value) sync* {
  if (value is GeneratedMessage) {
    yield value;
    for (final field in value.info_.fieldInfo.values) {
      if (value.hasField(field.tagNumber)) {
        yield* _visualMessages(value.getField(field.tagNumber));
      }
    }
  } else if (value is Map) {
    for (final entry in value.values) yield* _visualMessages(entry);
  } else if (value is Iterable) {
    for (final entry in value) yield* _visualMessages(entry);
  }
}

void _ensureAppearanceControls(App app) {
  final existingCards =
      ff.Pages.accountSettingsPage.widgets.all
          .where((widget) => widget.name == 'AppearanceSettingsCard')
          .toList();
  final firstSettingsRow =
      ff.Pages.accountSettingsPage.widgets.all
          .where((widget) => widget.name == 'WorkspaceMenuRow')
          .first;
  app.editPage(ff.Pages.accountSettingsPage, (page) {
    if (existingCards.isEmpty) {
      page.ensureInsertedBefore(
        firstSettingsRow,
        buildAppearanceSettingsCard(),
      );
    } else {
      page.ensureReplaced(existingCards.single, buildAppearanceSettingsCard());
    }
  });
}

DslWidget buildAppearanceSettingsCard() => Container(
  name: 'AppearanceSettingsCard',
  color: Colors.secondaryBackground,
  borderColor: Colors.alternate,
  borderWidth: 1,
  borderRadius: 8,
  padding: 16,
  child: Column(
    crossAxis: CrossAxis.start,
    spacing: 12,
    children: [
      Row(
        spacing: 12,
        children: [
          Icon('palette_outlined', size: 26, color: Colors.info),
          Expanded(
            Column(
              crossAxis: CrossAxis.start,
              spacing: 3,
              children: [
                Text('Appearance', style: Styles.titleMedium),
                Text(
                  'Choose the look that is easiest to read.',
                  style: Styles.bodySmall,
                  color: Colors.secondaryText,
                  maxLines: 2,
                ),
              ],
            ),
          ),
        ],
      ),
      Text(
        'Light mode is active',
        name: 'LightThemeStatus',
        style: Styles.labelMedium,
        color: Colors.success,
        visible: const Global(GlobalProperty.isLightMode),
      ),
      Text(
        'Dark mode is active',
        name: 'DarkThemeStatus',
        style: Styles.labelMedium,
        color: Colors.success,
        visible: const Global(GlobalProperty.isDarkMode),
      ),
      Row(
        spacing: 10,
        children: [
          Expanded(
            Button(
              'Light',
              name: 'LightThemeButton',
              icon: 'light_mode',
              height: 48,
              variant: ButtonVariant.outlined,
              color: Colors.alternate,
              textColor: Colors.primaryText,
              onTap: const SetDarkMode(DarkModePreference.light),
            ),
          ),
          Expanded(
            Button(
              'Dark',
              name: 'DarkThemeButton',
              icon: 'dark_mode',
              height: 48,
              variant: ButtonVariant.outlined,
              color: Colors.alternate,
              textColor: Colors.primaryText,
              onTap: const SetDarkMode(DarkModePreference.dark),
            ),
          ),
        ],
      ),
      Button(
        'Use device setting',
        name: 'SystemThemeButton',
        icon: 'settings_suggest_outlined',
        width: double.infinity,
        height: 48,
        variant: ButtonVariant.text,
        textColor: Colors.primaryText,
        onTap: const SetDarkMode(DarkModePreference.system),
      ),
      Text(
        'Your choice is saved on this device.',
        style: Styles.bodySmall,
        color: Colors.secondaryText,
      ),
    ],
  ),
);

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
    required this.savePartnerListingV2,
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
  final Endpoint savePartnerListingV2;
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
  final partnerListingItem = StructHandle('MobilePartnerListingItem', {
    ...ff.Structs.mobilePartnerListingItem.fields,
    'availableFromMillis': int_,
    'availableUntilMillis': int_,
    'categoryId': string,
    'description': string,
    'originalPriceText': string,
    'priceText': string,
    'remainingSpotsText': string,
  }, description: generatedProjectStructDescription);
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
  final writeResponse = StructHandle('MobileWriteResponse', {
    ...ff.Structs.mobileWriteResponse.fields,
    'error': string,
  }, description: generatedProjectStructDescription);

  app.raw(migratePartnerEditorResponseFields);
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

  const authSettings = EndpointSettings(
    requireAuthentication: true,
    escapeVariablesInRequestBody: true,
    encodeBodyUtf8: true,
    decodeUtf8: true,
  );
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
    'CreateBookingRequestV2',
    '/api/booking-request',
    variables: {
      'email': string,
      'listingId': string,
      'message': string,
      'name': string,
      'partySize': string,
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
  final savePartnerListingV2 = Endpoint.post(
    'SavePartnerListingV2',
    '/api/partner/listings',
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
    headers: authHeaders,
    settings: authSettings,
    body: const {
      'availableFromMillis': '<availableFromMillis>',
      'availableUntilMillis': '<availableUntilMillis>',
      'businessId': '<businessId>',
      'description': '<description>',
      'listingId': '<listingId>',
      'originalPrice': '<originalPrice>',
      'price': '<price>',
      'primaryCategoryId': '<category>',
      'remainingSpots': '<remainingSpots>',
      'requireAvailabilityWindow': true,
      'saveMode': '<saveMode>',
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
      savePartnerListingV2,
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
    savePartnerListingV2: savePartnerListingV2,
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
    ],
    homePage: 'DiscoverPage',
    signInPage: 'SignInPage',
    autoCreateUserDocument: false,
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

  app.editPageOnLoad(ff.Pages.savedPage, [
    If(
      const Global(GlobalProperty.isUserLoggedIn),
      then: _loadSavedAccount(api, 'initial'),
      orElse: [
        SetState.clear('savedPlanItems'),
        SetState.clear('savedDeals'),
        SetState.clear('bookingRequests'),
        SetState('bookingRequestsViewState', 'signedOut'),
      ],
    ),
  ]);
}

List<DslAction> _loadSavedAccount(_GoFunMotionApi api, String prefix) => [
  SetState('bookingRequestsViewState', 'loading'),
  ApiCall(
    api.getSavedPlans,
    outputAs: '${prefix}SavedPlans',
    params: {'token': const AuthUser(AuthUserField.jwtToken)},
    onSuccess: (result) => [SetState('savedPlanItems', result['savedPlans'])],
    onFailure: [SetState('bookingRequestsViewState', 'error')],
  ),
  ApiCall(
    api.getSavedListings,
    outputAs: '${prefix}SavedDeals',
    params: {'token': const AuthUser(AuthUserField.jwtToken)},
    onSuccess: (result) => [SetState('savedDeals', result['savedListings'])],
    onFailure: [SetState('bookingRequestsViewState', 'error')],
  ),
  ApiCall(
    api.getMyBookingRequests,
    outputAs: '${prefix}SavedRequests',
    params: {'token': const AuthUser(AuthUserField.jwtToken)},
    onSuccess:
        (result) => [
          SetState('bookingRequests', result['bookingRequests']),
          SetState('bookingRequestsViewState', 'ready'),
        ],
    onFailure: [SetState('bookingRequestsViewState', 'error')],
  ),
];

void migratePartnerEditorResponseFields(FFProject project) {
  final fields = {
    'MobilePartnerListingItem': {
      'availableFromMillis': ff_types.intType,
      'availableUntilMillis': ff_types.intType,
      'categoryId': ff_types.stringType,
      'description': ff_types.stringType,
      'originalPriceText': ff_types.stringType,
      'priceText': ff_types.stringType,
      'remainingSpotsText': ff_types.stringType,
    },
    'MobileWriteResponse': {'error': ff_types.stringType},
  };
  for (final struct in fields.entries) {
    for (final field in struct.value.entries) {
      if (findDataStructField(
            project,
            structName: struct.key,
            fieldName: field.key,
          ) ==
          null) {
        addDataStructField(
          project,
          structName: struct.key,
          fieldName: field.key,
          type: field.value,
          description: '${struct.key}.${field.key}',
        );
      } else {
        updateDataStructField(
          project,
          structName: struct.key,
          fieldName: field.key,
          type: field.value,
          isList: false,
        );
      }
    }
  }
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
    state.ensureField('bookingSent', bool_.withDefault(false));
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
                'email': WidgetState(
                  'RequestEmailField',
                  WidgetStateProperty.text,
                ),
                'listingId': State('listing')['id'],
                'message': WidgetState(
                  ff.Pages.dealDetailPage.widgets
                      .byKey('TextField_844shv74')
                      .single,
                  WidgetStateProperty.text,
                ),
                'name': WidgetState(
                  'RequestNameField',
                  WidgetStateProperty.text,
                ),
                'partySize': WidgetState(
                  'PartySizeField',
                  WidgetStateProperty.text,
                ),
                'requestedDate': WidgetState(
                  'RequestedDateField',
                  WidgetStateProperty.text,
                ),
                'requestedTime': WidgetState(
                  'RequestedTimeField',
                  WidgetStateProperty.text,
                ),
                'token': const AuthUser(AuthUserField.jwtToken),
              },
              onSuccess:
                  (_) => [
                    SetState('bookingSent', true),
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

    page.bindVisible(
      ff.Pages.dealDetailPage.widgets.byKey('Button_md8o2kqd').single,
      Not(State('bookingSent')),
    );
    page.ensureInsertedAfter(
      ff.Pages.dealDetailPage.widgets.byKey('Button_md8o2kqd').single,
      Column(
        name: 'BookingSentConfirmation',
        visible: State('bookingSent'),
        crossAxis: CrossAxis.start,
        spacing: 12,
        children: [
          Text('Booking request sent', style: Styles.titleLarge),
          Text(
            'Pending partner confirmation. No payment has been taken.',
            style: Styles.bodyMedium,
          ),
          Button(
            'View request status',
            icon: 'event_available',
            height: 48,
            onTap: Navigate(ff.Pages.savedPage),
          ),
        ],
      ),
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
                    SetState(
                      ff.Pages.adminPage.state.applications,
                      const ActionOutput('adminApps'),
                    ),
                    FirestoreQuery(
                      listings,
                      limit: 25,
                      outputAs: 'adminListingsQuery',
                    ),
                    SetState(
                      ff.Pages.adminPage.state.adminListings,
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
    for (final entry
        in {
          'Button_kpnez1rm': 'Review application',
          'Button_6hu39yl6': 'Review listing',
        }.entries) {
      final name =
          entry.key == 'Button_kpnez1rm'
              ? 'ReviewPartnerApplicationOnWeb'
              : 'ReviewListingOnWeb';
      final target = ff.Pages.adminPage.widgets.all.singleWhere(
        (widget) => widget.key == entry.key || widget.name == name,
      );
      page.ensureReplaced(
        target,
        Button(
          entry.value,
          name: name,
          icon: 'open_in_new',
          height: 48,
          borderRadius: 8,
          onTap: LaunchUrl('https://gofunmotion.com/admin'),
        ),
      );
    }
    for (final key in ['Button_j78gs2uu', 'Button_8nao7dig']) {
      for (final widget in ff.Pages.adminPage.widgets.all.where(
        (widget) => widget.key == key,
      )) {
        page.ensureRemoved(widget);
      }
    }
    page.ensureReplaced(
      ff.Pages.adminPage.widgets.all.singleWhere(
        (widget) =>
            widget.key == 'Container_bh4mhw9y' ||
            widget.name == 'AdminReviewIntro',
      ),
      Column(
        name: 'AdminReviewIntro',
        crossAxis: CrossAxis.start,
        spacing: 8,
        children: [
          Text('Partner review', style: Styles.headlineSmall),
          Text(
            'Review applications and manage publishing in the web admin.',
            style: Styles.bodyMedium,
            color: Colors.secondaryText,
          ),
          Button(
            'Open web admin',
            icon: 'open_in_new',
            height: 48,
            visible: State('isAdmin'),
            onTap: LaunchUrl('https://gofunmotion.com/admin'),
          ),
        ],
      ),
    );
  });
}

void _wireAiAssistants(App app, _GoFunMotionApi api, Object dealEditor) {
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
            Text('Your next last-minute offer', style: Styles.titleMedium),
            Text(
              'Open spots today? Add a deal and submit it for review.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            Button(
              'Create Last-Minute Deal',
              name: 'CreateLastMinuteDealButton',
              width: double.infinity,
              height: 48,
              icon: 'add',
              borderRadius: 8,
              onTap: If(
                Equals(State('currentBusinessId'), ''),
                then: [
                  Snackbar(
                    'An approved business is required before creating deals.',
                  ),
                ],
                orElse: [
                  Navigate(
                    dealEditor,
                    params: {'businessId': State('currentBusinessId')},
                  ),
                ],
              ),
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
              'Refresh saved items',
              name: 'RefreshCustomerBookingRequestsButton',
              width: double.infinity,
              height: 48,
              icon: 'refresh',
              borderRadius: 8,
              variant: ButtonVariant.outlined,
              onTap: _loadSavedAccount(api, 'refresh'),
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

void _wirePartnerDealWorkflow(App app, _GoFunMotionApi api, Object dealEditor) {
  app.editPage(ff.Pages.partnerDashboardPage, (page) {
    final setupButton = page.findByText('Request Listing Setup');

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
                        Button(
                          'Edit Deal',
                          name: 'EditPartnerDealButton',
                          width: double.infinity,
                          height: 44,
                          borderRadius: 8,
                          icon: 'edit',
                          variant: ButtonVariant.outlined,
                          onTap: Navigate(
                            dealEditor,
                            params: {
                              'businessId': listing['businessId'],
                              'listingId': listing['id'],
                              'initialTitle': listing['title'],
                              'initialDescription': listing['description'],
                              'initialCategory': listing['categoryId'],
                              'initialOriginalPrice':
                                  listing['originalPriceText'],
                              'initialPrice': listing['priceText'],
                              'initialSpots': listing['remainingSpotsText'],
                              'initialStartMillis':
                                  listing['availableFromMillis'],
                              'initialEndMillis':
                                  listing['availableUntilMillis'],
                            },
                          ),
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

    // Typed handles resolve by path in SDK 0.0.40. Remove siblings last so
    // earlier replacements cannot shift onto a different existing panel.
    for (final oldPanel in ff.Pages.partnerDashboardPage.widgets.all.where(
      (widget) => widget.name == 'PartnerDealFactsPanel',
    )) {
      page.ensureRemoved(oldPanel);
    }
  });
}

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
      const Wait(500),
      Navigate(ff.Pages.discoverPage, allowBack: false, replaceRoute: true),
    ],
    body: Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        color: Colors.primaryBackground,
        child: Image(
          'https://gofunmotion.com/brand/gofunmotion-splash-motion.gif',
          name: 'GoFunMotionAnimatedSplashGif',
          isNetwork: true,
          fit: ImageFit.cover,
          width: double.infinity,
          height: double.infinity,
        ),
      ),
    ),
  );

  final existingSplash = ff.Pages.all.where(
    (page) => page.name == 'SplashPage',
  );
  if (existingSplash.isNotEmpty) {
    final splash = existingSplash.single;
    app.editPageOnLoad(splash, [
      const Wait(500),
      Navigate(ff.Pages.discoverPage, allowBack: false, replaceRoute: true),
    ]);
    app.editPage(splash, (page) {
      page.ensureReplaced(
        splash.widgets.all.singleWhere(
          (widget) => widget.name == 'GoFunMotionAnimatedSplashGif',
        ),
        Image(
          'https://gofunmotion.com/brand/gofunmotion-splash-motion.gif',
          name: 'GoFunMotionAnimatedSplashGif',
          isNetwork: true,
          fit: ImageFit.contain,
          width: double.infinity,
          height: double.infinity,
        ),
      );
    });
  }

  app.raw((project) {
    setInitialPage(project, pageName: 'SplashPage');
    final settings = project.ensureAppSettings();
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
