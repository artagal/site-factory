import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/api_helpers.dart'
    show findApiEndpoint;
import 'package:flutterflow_ai/src/helpers/theme_helpers.dart'
    show ffColor, ffThemeColor;
import 'package:protobuf/protobuf.dart' show GeneratedMessage;
import 'package:flutterflow_ai/src/helpers/routing_helpers.dart'
    show setPageRequiresAuth;
import '../lib/flutterflow_project.dart' as ff;
import 'ai_experience.dart';

const expandedPageNames = <String>[
  'IntroOnboardingPage',
  'RoleSelectionPage',
  'CustomerOnboardingPage',
  'BusinessOnboardingPage',
  'CustomerRequestsPage',
  'CustomerRequestDetailPage',
  'PartnerInboxPage',
  'PartnerRequestDetailPage',
  'PartnerListingsPage',
  'PartnerListingOverviewPage',
  'EditProfilePage',
  'AccountSettingsPage',
  'NotificationSettingsPage',
  'NotificationsPage',
  'DeleteAccountPage',
  'DealsMapPage',
  'ListingReviewsPage',
  'WriteReviewPage',
  'PartnerSubscriptionPage',
  'PartnerTeamPage',
  'PartnerTeamMemberPage',
  'PartnerAnalyticsPage',
  'PartnerBusinessProfilePage',
  'PartnerSettingsPage',
  'AdminApplicationsPage',
  'AdminApplicationDetailPage',
  'AdminListingsPage',
  'AdminListingDetailPage',
  'AdminBusinessesPage',
  'AdminBusinessDetailPage',
  'AdminUsersPage',
  'AdminUserDetailPage',
  'AdminCitiesPage',
  'AdminCityEditorPage',
  'AdminCategoriesPage',
  'AdminCategoryEditorPage',
  'AdminBookingsPage',
  'AdminBookingDetailPage',
  'AdminReviewsPage',
  'AdminReviewDetailPage',
  'AdminAuditLogPage',
  'AdminMetricsPage',
  'PrivacyPage',
  'TermsPage',
  'SupportPage',
];

const workspacePublicPages = {
  'IntroOnboardingPage',
  'RoleSelectionPage',
  'BusinessOnboardingPage',
  'DealsMapPage',
  'ListingReviewsPage',
  'PrivacyPage',
  'TermsPage',
  'SupportPage',
};

Object workspacePage(String name) {
  final existing = ff.Pages.all.where((page) => page.name == name);
  return existing.isEmpty ? name : existing.single;
}

final class WorkspaceApi {
  WorkspaceApi(
    this.read,
    this.write,
    this.access,
    this.lookup,
    this.approve,
    this.moderate,
    this.deleteAccount,
    this.row,
    this.response,
  );
  final Endpoint read, write, access, lookup, approve, moderate, deleteAccount;
  final StructHandle row, response;
}

WorkspaceApi declareWorkspaceApi(App app, {bool reuseExistingProject = true}) {
  final row = app.struct('MobileWorkspaceRow', {
    for (final key in [
      'id',
      'title',
      'subtitle',
      'detail',
      'status',
      'value',
      'referenceId',
      'businessId',
      'imageUrl',
      'mapUrl',
      'mapEmbedUrl',
    ])
      key: string,
  });
  final response =
      reuseExistingProject
          ? ff.Structs.mobileWorkspaceResponse
          : app.struct('MobileWorkspaceResponse', {
            for (final key in [
              'title',
              'summary',
              'detail',
              'status',
              'id',
              'businessId',
              'nextCursor',
              'field1',
              'field2',
              'field3',
              'field4',
              'field5',
              'field6',
              'contactName',
              'contactEmail',
              'contactPhone',
              'contactEmailUrl',
              'contactPhoneUrl',
              'mapUrl',
              'venueAddress',
              'partySize',
            ])
              key: string,
            'rows': listOf(row),
            'canEdit': bool_,
            'flag': bool_,
            'hasMore': bool_,
            'empty': bool_,
            'startMillis': int_,
            'endMillis': int_,
          });
  final writeResponse = app.struct('MobileWorkspaceWriteResponse', {
    'message': string,
    'id': string,
    'businessId': string,
    'deleted': bool_,
  });
  final accessResponse = app.struct('MobileWorkspaceAccess', {
    'isAdmin': bool_,
    'primaryBusinessId': string,
    'role': string,
  });
  final lookupResponse = app.struct('MobileWorkspaceLookup', {
    'uid': string,
    'email': string,
    'displayName': string,
  });
  const authHeaders = {'Authorization': 'Bearer [token]'};
  const writes = EndpointSettings(
    requireAuthentication: true,
    escapeVariablesInRequestBody: true,
    encodeBodyUtf8: true,
    decodeUtf8: true,
  );
  final read = Endpoint.get(
    'ReadNativeWorkspace',
    '/api/mobile/workspace',
    variables: {
      for (final key in [
        'section',
        'id',
        'businessId',
        'cursor',
        'cityId',
        'token',
      ])
        key: string,
    },
    headers: authHeaders,
    response: response,
    settings: const EndpointSettings(decodeUtf8: true),
  );
  final write = Endpoint.post(
    'UpdateNativeWorkspace',
    '/api/mobile/workspace',
    variables: {
      for (final key in [
        'action',
        'id',
        'businessId',
        'token',
        'value1',
        'value2',
        'value3',
        'value4',
        'value5',
        'value6',
      ])
        key: string,
      'flag': bool_,
    },
    body: {
      for (final key in [
        'action',
        'id',
        'businessId',
        'value1',
        'value2',
        'value3',
        'value4',
        'value5',
        'value6',
        'flag',
      ])
        key: '<$key>',
    },
    headers: authHeaders,
    response: writeResponse,
    settings: writes,
  );
  final access = Endpoint.get(
    'GetNativeWorkspaceAccess',
    '/api/me/access',
    variables: {'token': string},
    headers: authHeaders,
    response: accessResponse,
    settings: const EndpointSettings(requireAuthentication: true),
  );
  final lookup = Endpoint.post(
    'FindNativeApplicationOwner',
    '/api/admin/users/lookup',
    variables: {'token': string, 'email': string},
    headers: authHeaders,
    body: {'email': '<email>'},
    response: lookupResponse,
    settings: writes,
  );
  final approve = Endpoint.post(
    'ApproveNativeApplication',
    '/api/admin/partner-applications/approve',
    variables: {'token': string, 'applicationId': string, 'ownerUid': string},
    headers: authHeaders,
    body: {
      'applicationId': '<applicationId>',
      'ownerUid': '<ownerUid>',
      'status': 'approved',
    },
    response: writeResponse,
    settings: writes,
  );
  final moderate = Endpoint.post(
    'ModerateNativeListing',
    '/api/admin/listings/moderate',
    variables: {
      'token': string,
      'listingId': string,
      'action': string,
      'reason': string,
    },
    headers: authHeaders,
    body: {
      'listingId': '<listingId>',
      'action': '<action>',
      'reason': '<reason>',
    },
    response: writeResponse,
    settings: writes,
  );
  final delete = Endpoint.post(
    'DeleteNativeAccount',
    '/api/account/delete',
    variables: {'token': string},
    headers: authHeaders,
    body: const {},
    response: writeResponse,
    settings: writes,
  );
  app.apiGroup(
    'GoFunMotionWorkspace',
    baseUrl: 'https://gofunmotion.com',
    headers: const {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    endpoints: [read, write, access, lookup, approve, moderate, delete],
  );
  return WorkspaceApi(
    read,
    write,
    access,
    lookup,
    approve,
    moderate,
    delete,
    row,
    response,
  );
}

void ensureExpandedWorkspace(App app, NativeAiApi ai) {
  final api = declareWorkspaceApi(app);
  final screens = NativeWorkspaceScreens(app, api, ai);
  screens.ensureMatureState();
  screens.build();
  screens.wireExistingEntries();
  screens.enhanceMatureWorkflows();
  app.raw(configureExpandedWorkspace);
}

void configureExpandedWorkspace(FFProject project) {
  final settings = project.ensureCodeGenerationSettings();
  const folderNames = [
    'onboarding',
    'customer',
    'partner',
    'administration',
    'support',
    'workspace_components',
  ];
  for (final name in folderNames) {
    final key = 'gfm_native_$name';
    if (!settings.rootFolders.any((folder) => folder.key == key)) {
      settings.rootFolders.add(FFCodeFolder(key: key, name: name));
    }
  }

  // Native query parameters are encoded by FlutterFlow's API manager.
  final read = findApiEndpoint(
    project,
    name: 'ReadNativeWorkspace',
    groupName: 'GoFunMotionWorkspace',
  );
  if (read == null) throw StateError('Native workspace API is missing.');
  read.url = '/api/mobile/workspace';
  for (final key in ['section', 'id', 'businessId', 'cursor', 'cityId']) {
    if (!read.parameters.any((parameter) => parameter.identifier.name == key)) {
      final variable = read.variables.singleWhere(
        (variable) => variable.identifier.name == key,
      );
      read.parameters.add(
        FFApiParameter(
          identifier: FFIdentifier(name: key, key: 'gfm_query_$key'),
          variableIdentifier: variable.identifier.deepCopy(),
          type: FFBaseDataType.String,
        ),
      );
    }
  }

  for (final name in expandedPageNames) {
    final page = findPage(project, name: name);
    if (page == null) throw StateError('Missing native workspace page: $name');
    if (![
      'CustomerRequestDetailPage',
      'PartnerRequestDetailPage',
    ].contains(name)) {
      page.classModel.stateFields.removeWhere(
        (field) => [
          'contactName',
          'contactEmail',
          'contactPhone',
          'contactEmailUrl',
          'contactPhoneUrl',
          'venueAddress',
          'partySize',
        ].contains(field.parameter.identifier.name),
      );
    }
    setPageRequiresAuth(
      project,
      pageName: name,
      requiresAuth: !workspacePublicPages.contains(name),
    );
    final folder =
        name.contains('Onboarding') || name == 'RoleSelectionPage'
            ? 'onboarding'
            : name.startsWith('Admin')
            ? 'administration'
            : name.startsWith('Partner')
            ? 'partner'
            : ['PrivacyPage', 'TermsPage', 'SupportPage'].contains(name)
            ? 'support'
            : 'customer';
    if ((settings.widgetClassKeyToFolderKey[page.node.key] ?? '').isEmpty) {
      settings.widgetClassKeyToFolderKey[page.node.key] = 'gfm_native_$folder';
    }
    for (final button in _workspaceMessages(page.node).whereType<FFButton>()) {
      if (button.text.colorValue.inputValue.themeColor !=
          FFColor_ThemeColor.PRIMARY_BACKGROUND)
        continue;
      final fill = button.fillColorValue.inputValue.themeColor;
      if (fill == FFColor_ThemeColor.PRIMARY) {
        button.fillColorValue = FFColorValue(
          inputValue: ffThemeColor(FFColor_ThemeColor.TERTIARY),
        );
        button.text.colorValue = FFColorValue(inputValue: ffColor(0xFF101217));
      } else if (fill == FFColor_ThemeColor.ERROR) {
        button.text.colorValue = FFColorValue(inputValue: ffColor(0xFF101217));
      }
    }
    for (final variable
        in _workspaceMessages(page.node).whereType<FFVariable>()) {
      if (variable.source == FFVariableSource.WIDGET_CLASS_PARAMETER &&
          variable.operations.isEmpty &&
          [
            'id',
            'businessId',
          ].contains(variable.baseVariable.widgetClass.paramIdentifier.name) &&
          !variable.hasDefaultValue()) {
        variable.defaultValue = FFParameterValue(serializedValue: '');
      }
    }
    for (final field in page.classModel.stateFields) {
      final type = field.parameter.dataType;
      if (type.hasListType() &&
          type.listType.scalarType == FFBaseDataType.DataStruct) {
        final elementType = type.listType.deepCopy();
        // FlutterFlow stores list subtypes on the outer type, not the element.
        if (type.hasSubType()) elementType.subType = type.subType.deepCopy();
        field.parameter.dataType = elementType;
        field.parameter.isList = true;
      }
      if (field.parameter.identifier.name == 'view') {
        field.serializedDefaultValue
          ..clear()
          ..add('ready');
      }
    }
  }
  for (final name in [
    'WorkspaceMenuRow',
    'WorkspaceStatusBadge',
    'WorkspaceEmptyState',
  ]) {
    final component = findComponent(project, name: name);
    if (component != null) {
      if ((settings.widgetClassKeyToFolderKey[component.node.key] ?? '')
          .isEmpty) {
        settings.widgetClassKeyToFolderKey[component.node.key] =
            'gfm_native_workspace_components';
      }
    }
  }
}

Iterable<GeneratedMessage> _workspaceMessages(Object? value) sync* {
  if (value is GeneratedMessage) {
    yield value;
    for (final field in value.info_.fieldInfo.values) {
      if (value.hasField(field.tagNumber))
        yield* _workspaceMessages(value.getField(field.tagNumber));
    }
  } else if (value is Map) {
    for (final entry in value.values) yield* _workspaceMessages(entry);
  } else if (value is Iterable) {
    for (final entry in value) yield* _workspaceMessages(entry);
  }
}

final class NativeWorkspaceScreens {
  int _outputSequence = 0;
  String outputName(String purpose) => 'nativeV2${purpose}${_outputSequence++}';
  NativeWorkspaceScreens(
    this.app,
    this.api,
    this.ai, {
    this.reuseExistingProject = true,
  }) {
    if (reuseExistingProject &&
        ff.Components.all.any(
          (component) => component.name == 'WorkspaceMenuRow',
        )) {
      final existingMenu = ff.Components.workspaceMenuRow;
      // The generated SDK labels callback parameters as JSON; keep the native Action type.
      menuRow = ProjectComponentHandle(
        name: existingMenu.name,
        key: existingMenu.key,
        params: existingMenu.params,
        state: existingMenu.state,
        widgets: existingMenu.widgets,
        paramTypes: {...existingMenu.paramTypes, 'onOpen': action},
      );
      statusBadge = ff.Components.workspaceStatusBadge;
      emptyBlock = ff.Components.workspaceEmptyState;
      return;
    }
    menuRow = app.component(
      'WorkspaceMenuRow',
      description:
          'Native settings/navigation row with accessible full-width tap target.',
      params: {
        'label': string.withDefault(''),
        'detail': string.withDefault(''),
        'onOpen': action,
      },
      body: Container(
        padding: 16,
        color: Colors.secondaryBackground,
        borderRadius: 8,
        onTap: const ParamAction('onOpen'),
        child: Row(
          spacing: 12,
          children: [
            Expanded(
              Column(
                crossAxis: CrossAxis.start,
                spacing: 4,
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
            Icon('chevron_right', size: 22, color: Colors.secondaryText),
          ],
        ),
      ),
    );
    statusBadge = app.component(
      'WorkspaceStatusBadge',
      description:
          'Shared status label, without conveying status through color alone.',
      params: {'label': string.withDefault('')},
      body: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        borderRadius: 6,
        color: Colors.secondaryBackground,
        child: Text(
          Param('label'),
          style: Styles.labelMedium,
          color: Colors.primaryText,
          maxLines: 2,
        ),
      ),
    );
    emptyBlock = app.component(
      'WorkspaceEmptyState',
      description: 'Honest empty-state message for API-backed native lists.',
      params: {'label': string.withDefault('Nothing here yet')},
      body: Column(
        crossAxis: CrossAxis.start,
        spacing: 12,
        children: [
          Icon('inbox_outlined', size: 32, color: Colors.secondaryText),
          Text(Param('label'), style: Styles.titleMedium),
        ],
      ),
    );
  }
  final App app;
  final WorkspaceApi api;
  final NativeAiApi ai;
  final bool reuseExistingProject;
  late final dynamic menuRow, statusBadge, emptyBlock;

  // Resolve shared actions against the latest generated handles on an edit pass.
  Object stateRef(ProjectPageHandle? page, String name) {
    if (page == null) return name;
    final dynamic state = page.state;
    return switch (name) {
      'view' => state.view,
      'message' => state.message,
      'isAdmin' => state.isAdmin,
      'role' => state.role,
      'businessId' => state.businessId,
      'title' => state.title,
      'summary' => state.summary,
      'detail' => state.detail,
      'status' => state.status,
      'recordId' => state.recordId,
      'rows' => state.rows,
      'canEdit' => state.canEdit,
      'flag' => state.flag,
      'hasMore' => state.hasMore,
      'empty' => state.empty,
      'cursor' => state.cursor,
      'nextCursor' => state.nextCursor,
      'startMillis' => state.startMillis,
      'endMillis' => state.endMillis,
      'contactName' => 'contactName',
      'contactEmail' => 'contactEmail',
      'contactPhone' => 'contactPhone',
      'contactEmailUrl' => 'contactEmailUrl',
      'contactPhoneUrl' => 'contactPhoneUrl',
      'mapUrl' => state.mapUrl,
      'venueAddress' => 'venueAddress',
      'partySize' => 'partySize',
      'cityId' => state.cityId,
      'cityLabel' => state.cityLabel,
      'cities' => state.cities,
      'field1' => state.field1,
      'field2' => state.field2,
      'field3' => state.field3,
      'field4' => state.field4,
      'field5' => state.field5,
      'field6' => state.field6,
      _ => throw ArgumentError('Unknown workspace field: $name'),
    };
  }

  Object paramRef(ProjectPageHandle? page, String name) {
    if (page == null) return name;
    final dynamic params = page.params;
    return switch (name) {
      'id' => params.id,
      'businessId' => params.businessId,
      _ => throw ArgumentError('Unknown workspace parameter: $name'),
    };
  }

  Object fieldRef(ProjectPageHandle? page, int index) =>
      page == null
          ? 'WorkspaceField$index'
          : page.widgets.all
              .where((widget) => widget.name == 'WorkspaceField$index')
              .single;

  Map<String, DslType> get state => {
    'view': string.withDefault('ready'),
    'message': string.withDefault(''),
    'busy': bool_.withDefault(false),
    'isAdmin': bool_.withDefault(false),
    'role': string.withDefault(''),
    'businessId': string.withDefault(''),
    'title': string.withDefault(''),
    'summary': string.withDefault(''),
    'detail': string.withDefault(''),
    'status': string.withDefault(''),
    'recordId': string.withDefault(''),
    'rows': listOf(api.row),
    'canEdit': bool_.withDefault(false),
    'flag': bool_.withDefault(false),
    'hasMore': bool_.withDefault(false),
    'empty': bool_.withDefault(false),
    'cursor': string.withDefault(''),
    'nextCursor': string.withDefault(''),
    'nextStatus': string.withDefault('contacted'),
    'confirmed': bool_.withDefault(false),
    'startMillis': int_.withDefault(0),
    'endMillis': int_.withDefault(0),
    'ownerUid': string.withDefault(''),
    'ownerEmail': string.withDefault(''),
    'cityId': string.withDefault(''),
    'cityLabel': string.withDefault('Choose a city'),
    'cities': listOf(ai.city),
    'showCities': bool_.withDefault(false),
    'mapUrl': string.withDefault(''),
    'contactName': string.withDefault(''),
    'contactEmail': string.withDefault(''),
    'contactPhone': string.withDefault(''),
    'contactEmailUrl': string.withDefault(''),
    'contactPhoneUrl': string.withDefault(''),
    'venueAddress': string.withDefault(''),
    'partySize': string.withDefault(''),
    for (var i = 1; i <= 6; i++) 'field$i': string.withDefault(''),
  };

  DslWidget nav(
    String label,
    String target, {
    String detail = '',
    Object? id,
    Object? businessId,
  }) => menuRow(
    label: label,
    detail: detail,
    onOpen: Navigate(
      workspacePage(target),
      params: {
        if (expandedPageNames.contains(target)) 'id': id ?? '',
        if (expandedPageNames.contains(target))
          'businessId': businessId ?? State('businessId'),
      },
    ),
  );

  DslWidget command(
    String label,
    Object actions, {
    String icon = 'check',
    Object? visible,
    bool danger = false,
  }) => Column(
    visible: visible,
    children: [
      Button(
        label,
        height: 52,
        width: double.infinity,
        borderRadius: 8,
        icon: icon,
        color: danger ? Colors.error : Colors.tertiary,
        textColor: Colors.hex(0xFF101217),
        visible: Not(State('busy')),
        onTap: actions,
      ),
    ],
  );

  DslWidget field(
    int index,
    String label, {
    int lines = 1,
    Keyboard keyboard = Keyboard.text,
  }) => TextField(
    name: 'WorkspaceField$index',
    label: label,
    keyboard: keyboard,
    maxLines: lines,
  );

  List<DslAction> load(
    String section, {
    List<int> fields = const [],
    ProjectPageHandle? page,
  }) => [
    SetState(stateRef(page, 'view'), 'loading'),
    ApiCall(
      api.read,
      outputAs: outputName('workspaceRead'),
      params: {
        'section': section,
        'id': Param(paramRef(page, 'id')),
        'businessId': State(stateRef(page, 'businessId')),
        'cursor': State(stateRef(page, 'cursor')),
        'cityId': State(stateRef(page, 'cityId')),
        'token': const AuthUser(AuthUserField.jwtToken),
      },
      onSuccess:
          (result) => [
            for (final key in [
              'title',
              'summary',
              'detail',
              'status',
              'businessId',
              'rows',
              'canEdit',
              'flag',
              'hasMore',
              'empty',
              'nextCursor',
              'startMillis',
              'endMillis',
              'field1',
              'field2',
              'field3',
              'field4',
              'field5',
              'field6',
              if (section == 'request' || section == 'partner-request') ...[
                'contactName',
                'contactEmail',
                'contactPhone',
                'contactEmailUrl',
                'contactPhoneUrl',
                'mapUrl',
                'venueAddress',
                'partySize',
              ],
            ])
              SetState(stateRef(page, key), result[key]),
            SetState(stateRef(page, 'recordId'), result['id']),
            for (final index in fields)
              SetFormField(fieldRef(page, index), result['field$index']),
            SetState(stateRef(page, 'view'), 'ready'),
          ],
      onFailure: [
        SetState(stateRef(page, 'view'), 'error'),
        SetState(
          stateRef(page, 'message'),
          'Could not load this screen. Check your connection and account access, then retry.',
        ),
      ],
    ),
  ];

  List<DslAction> save(
    String action, {
    Map<String, Object?> values = const {},
    String? reload,
    String? after,
  }) => [
    If(
      Not(State('busy')),
      then: [
        SetState('busy', true),
        SetState('message', ''),
        ApiCall(
          api.write,
          outputAs: outputName('workspaceWrite'),
          params: {
            'token': const AuthUser(AuthUserField.jwtToken),
            'action': action,
            'id': PageParam('id'),
            'businessId': State('businessId'),
            for (var i = 1; i <= 6; i++) 'value$i': '',
            'flag': State('flag'),
            ...values,
          },
          onSuccess:
              (result) => [
                SetState('busy', false),
                SetState('message', result['message']),
                SetState('confirmed', false),
                if (reload != null) ...load(reload),
                if (after != null)
                  Navigate(
                    workspacePage(after),
                    params: {'id': '', 'businessId': State('businessId')},
                    replaceRoute: true,
                  ),
              ],
          onFailure: [
            SetState('busy', false),
            SetState('confirmed', false),
            SetState(
              'message',
              'Not saved. Check required fields, permissions and the current status, then retry.',
            ),
          ],
        ),
      ],
    ),
  ];

  Object input(int i) =>
      WidgetState('WorkspaceField$i', WidgetStateProperty.text);

  List<DslAction> onLoad(
    String name, {
    String? section,
    List<int> fields = const [],
    List<DslAction> extra = const [],
    ProjectPageHandle? page,
  }) {
    final actions = <DslAction>[
      SetState(
        stateRef(page, 'businessId'),
        Param(paramRef(page, 'businessId')),
      ),
      if (section != null)
        ...load(section, fields: fields, page: page)
      else
        SetState(stateRef(page, 'view'), 'ready'),
      ...extra,
    ];
    if (workspacePublicPages.contains(name)) return actions;
    return [
      SetState(stateRef(page, 'view'), 'loading'),
      If(
        const Global(GlobalProperty.isUserLoggedIn),
        then: [
          ApiCall(
            api.access,
            outputAs: outputName('workspaceAccess'),
            params: {'token': const AuthUser(AuthUserField.jwtToken)},
            onSuccess:
                (result) => [
                  SetState(stateRef(page, 'isAdmin'), result['isAdmin']),
                  SetState(stateRef(page, 'role'), result['role']),
                  SetState(
                    stateRef(page, 'businessId'),
                    Param(paramRef(page, 'businessId')),
                  ),
                  if (name.startsWith('Admin'))
                    If(
                      result['isAdmin'],
                      then: [
                        if (section != null)
                          ...load(section, fields: fields, page: page)
                        else
                          SetState(stateRef(page, 'view'), 'ready'),
                        ...extra,
                      ],
                      orElse: [SetState(stateRef(page, 'view'), 'denied')],
                    )
                  else ...[
                    if (section != null)
                      ...load(section, fields: fields, page: page)
                    else
                      SetState(stateRef(page, 'view'), 'ready'),
                    ...extra,
                  ],
                ],
            onFailure: [
              SetState(stateRef(page, 'view'), 'error'),
              SetState(
                stateRef(page, 'message'),
                'Account access could not be checked. Retry or sign in again.',
              ),
            ],
          ),
        ],
        orElse: [Navigate(ff.Pages.signInPage, replaceRoute: true)],
      ),
    ];
  }

  List<DslWidget> feedback(
    String name, {
    String? section,
    List<int> fields = const [],
    ProjectPageHandle? page,
  }) => [
    ProgressBar.circular(size: 28, visible: Equals(State('view'), 'loading')),
    ProgressBar.circular(size: 28, visible: State('busy')),
    Text(
      State('message'),
      style: Styles.bodyMedium,
      color: Colors.primaryText,
      visible: Not(Equals(State('message'), '')),
    ),
    Column(
      visible: Equals(State('view'), 'error'),
      spacing: 12,
      children: [
        command(
          'Retry',
          onLoad(name, section: section, fields: fields, page: page),
          icon: 'refresh',
        ),
        Button(
          'Sign in again',
          height: 44,
          variant: ButtonVariant.text,
          textColor: Colors.primaryText,
          onTap: Navigate(ff.Pages.signInPage),
        ),
      ],
    ),
    Column(
      visible: Equals(State('view'), 'denied'),
      crossAxis: CrossAxis.start,
      spacing: 12,
      children: [
        Icon('lock_outline', color: Colors.secondaryText, size: 32),
        Text('Administrator access required', style: Styles.titleMedium),
        Button(
          'Back to account',
          height: 48,
          onTap: Navigate(ff.Pages.profilePage),
        ),
      ],
    ),
  ];

  void page(
    String name,
    String title,
    List<DslWidget> children, {
    String? section,
    List<int> fields = const [],
    bool scrollable = true,
    List<DslAction> Function(ProjectPageHandle? page)? extra,
  }) {
    final existing = ff.Pages.all.where((page) => page.name == name);
    if (reuseExistingProject && existing.isNotEmpty) {
      final handle = existing.single;
      List<DslAction> actions() => onLoad(
        name,
        section: section,
        fields: fields,
        extra: extra?.call(handle) ?? const [],
        page: handle,
      );
      app.editPageOnLoad(handle, actions());
      final retry = handle.widgets.all.where(
        (widget) => widget.type == 'Button' && widget.text == 'Retry',
      );
      if (retry.isNotEmpty) {
        app.editPage(
          handle,
          (edit) => edit.ensureActions(
            retry.single,
            triggerType: FFActionTriggerType.ON_TAP,
            actions: actions(),
          ),
        );
      }
      return;
    }
    app.ensurePage(
      name,
      route:
          '/${name.replaceAll('Page', '').replaceAllMapped(RegExp(r'[A-Z]'), (m) => '-${m[0]!.toLowerCase()}').substring(1)}',
      description:
          '$title. Native editable widgets and actions; server-authorized data.',
      params: {
        'id': string.withDefault(''),
        'businessId': string.withDefault(''),
      },
      state: state,
      onLoad: onLoad(
        name,
        section: section,
        fields: fields,
        extra: extra?.call(null) ?? const [],
      ),
      body: Scaffold(
        appBar: AppBar(title: title),
        body: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            name: 'WorkspaceScreenBody',
            crossAxis: CrossAxis.start,
            spacing: 16,
            children: [
              ...feedback(name, section: section, fields: fields),
              Expanded(
                Column(
                  name: 'WorkspaceReadyContent',
                  visible: Equals(State('view'), 'ready'),
                  crossAxis: CrossAxis.start,
                  spacing: 14,
                  scrollable: scrollable,
                  children: children,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<DslWidget> recordHeader() => [
    Text(State('title'), style: Styles.headlineSmall),
    Text(
      State('summary'),
      style: Styles.bodyMedium,
      color: Colors.secondaryText,
      visible: Not(Equals(State('summary'), '')),
    ),
    statusBadge(
      label: State('status'),
      visible: Not(Equals(State('status'), '')),
    ),
    Text(
      State('detail'),
      style: Styles.bodyLarge,
      visible: Not(Equals(State('detail'), '')),
    ),
  ];

  DslWidget rows({
    String? target,
    bool notification = false,
    bool map = false,
    bool metrics = false,
  }) => ListView(
    name: 'WorkspaceRecordList',
    source: State('rows'),
    spacing: 12,
    itemBuilder:
        (item) => Container(
          padding: 16,
          borderRadius: 8,
          color: Colors.secondaryBackground,
          onTap:
              target == null
                  ? null
                  : Navigate(
                    workspacePage(target),
                    params: {
                      'id': item['id'],
                      'businessId': item['businessId'],
                    },
                  ),
          child: Column(
            crossAxis: CrossAxis.start,
            spacing: 8,
            children: [
              Row(
                spacing: 10,
                children: [
                  Expanded(
                    Text(item['title'], style: Styles.titleMedium, maxLines: 3),
                  ),
                  if (target != null)
                    Icon(
                      'chevron_right',
                      size: 22,
                      color: Colors.secondaryText,
                    ),
                ],
              ),
              Text(
                item['subtitle'],
                style: Styles.bodyMedium,
                color: Colors.secondaryText,
                maxLines: 3,
                visible: Not(Equals(item['subtitle'], '')),
              ),
              Text(
                item['value'],
                style: metrics ? Styles.headlineSmall : Styles.titleMedium,
                color: Colors.tertiary,
                visible: Not(Equals(item['value'], '')),
              ),
              Text(
                item['status'],
                style: Styles.labelMedium,
                visible: Not(Equals(item['status'], '')),
              ),
              if (target == null)
                Text(
                  item['detail'],
                  style: Styles.bodyMedium,
                  visible: Not(Equals(item['detail'], '')),
                ),
              if (notification)
                Button(
                  'Mark as read',
                  icon: 'done',
                  height: 44,
                  variant: ButtonVariant.outlined,
                  visible: Equals(item['value'], 'Unread'),
                  onTap: save(
                    'notification-read',
                    values: {'id': item['id']},
                    reload: 'notifications',
                  ),
                ),
              if (map) ...[
                Button(
                  'Show on map',
                  icon: 'map_outlined',
                  height: 44,
                  onTap: SetState('mapUrl', item['mapEmbedUrl']),
                ),
                Button(
                  'Directions',
                  icon: 'directions_outlined',
                  height: 44,
                  variant: ButtonVariant.outlined,
                  onTap: LaunchUrl(item['mapUrl']),
                ),
                Button(
                  'View deal',
                  icon: 'local_offer_outlined',
                  height: 44,
                  variant: ButtonVariant.text,
                  onTap: Navigate(
                    ff.Pages.dealDetailPage,
                    params: {
                      'listingRef': CustomFunction(
                        ai.listingReference,
                        args: {'listingId': item['referenceId']},
                      ),
                    },
                  ),
                ),
              ],
            ],
          ),
        ),
  );

  void listPage(
    String name,
    String title,
    String section, {
    String? target,
    List<DslWidget> before = const [],
    bool notification = false,
    bool metrics = false,
    String empty = 'Nothing here yet',
  }) {
    page(
      name,
      title,
      [
        ...before,
        Row(
          mainAxis: MainAxis.spaceBetween,
          children: [
            Text(
              'Records',
              style: Styles.labelMedium,
              color: Colors.secondaryText,
            ),
            IconButton(
              'refresh',
              size: 24,
              onTap: [SetState('cursor', ''), ...load(section)],
              name: 'RefreshWorkspaceList',
            ),
          ],
        ),
        emptyBlock(label: empty, visible: State('empty')),
        Expanded(
          rows(target: target, notification: notification, metrics: metrics),
        ),
        Row(
          spacing: 12,
          children: [
            Expanded(
              Button(
                'First page',
                height: 44,
                variant: ButtonVariant.outlined,
                onTap: [SetState('cursor', ''), ...load(section)],
              ),
            ),
            Expanded(
              Button(
                'Next page',
                height: 44,
                icon: 'arrow_forward',
                visible: State('hasMore'),
                onTap: [
                  SetState('cursor', State('nextCursor')),
                  ...load(section),
                ],
              ),
            ),
          ],
        ),
      ],
      section: section,
      scrollable: false,
    );
  }

  List<DslAction> loadCities({ProjectPageHandle? page}) => [
    ApiCall(
      ai.cities,
      outputAs: outputName('workspaceCities'),
      onSuccess:
          (result) => [SetState(stateRef(page, 'cities'), result['cities'])],
      onFailure: [
        SetState(
          stateRef(page, 'message'),
          'Cities could not load. Retry before selecting a city.',
        ),
      ],
    ),
  ];

  DslWidget cityChooser() => Column(
    crossAxis: CrossAxis.start,
    spacing: 8,
    children: [
      Button(
        State('cityLabel'),
        icon: 'location_city_outlined',
        height: 48,
        width: double.infinity,
        variant: ButtonVariant.outlined,
        onTap: [SetState.toggle('showCities'), ...loadCities()],
      ),
      Container(
        height: 180,
        visible: State('showCities'),
        child: ListView(
          source: State('cities'),
          spacing: 6,
          itemBuilder:
              (city) => Button(
                city['label'],
                height: 48,
                width: double.infinity,
                variant: ButtonVariant.text,
                onTap: [
                  SetState('cityId', city['id']),
                  SetState('cityLabel', city['label']),
                  SetState('showCities', false),
                ],
              ),
        ),
      ),
    ],
  );

  void ensureMatureState() {
    // These fields are intentionally page-local. BeautyDrop proved the value
    // of the workflows, but its large global-state model is not copied here.
    for (final page in ff.Pages.all.where(
      (page) => [
        'CustomerRequestDetailPage',
        'PartnerRequestDetailPage',
      ].contains(page.name),
    )) {
      app.editPageState(page, (state) {
        state.ensureField('contactName', string);
        state.ensureField('contactEmail', string);
        state.ensureField('contactPhone', string);
        state.ensureField('contactEmailUrl', string);
        state.ensureField('contactPhoneUrl', string);
        state.ensureField('venueAddress', string);
        state.ensureField('partySize', string);
      });
    }
  }

  void enhanceMatureWorkflows() {
    _replaceRequestList(
      ff.Pages.partnerInboxPage,
      target: 'PartnerRequestDetailPage',
      heading: 'Customer requests',
    );
    _replaceRequestList(
      ff.Pages.customerRequestsPage,
      target: 'CustomerRequestDetailPage',
      heading: 'Your requests',
    );
    _enhanceRequestDetail(ff.Pages.partnerRequestDetailPage, partner: true);
    _enhanceRequestDetail(ff.Pages.customerRequestDetailPage, partner: false);

    app.editPage(ff.Pages.partnerListingOverviewPage, (edit) {
      final existing =
          ff.Pages.partnerListingOverviewPage.widgets.all
              .where((widget) => widget.name == 'DuplicateDealCard')
              .toList();
      final card = Container(
        name: 'DuplicateDealCard',
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 10,
          children: [
            Row(
              spacing: 10,
              children: [
                const Icon(
                  'content_copy_outlined',
                  size: 22,
                  color: Colors.tertiary,
                ),
                Expanded(
                  Text('Run this deal again', style: Styles.titleMedium),
                ),
              ],
            ),
            Text(
              'Creates a private draft with the same content and prices. Availability and spots are cleared, and admin review is required again.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            command(
              'Duplicate as draft',
              save('partner-listing-duplicate', after: 'PartnerListingsPage'),
              icon: 'content_copy_outlined',
            ),
          ],
        ),
      );
      if (existing.isNotEmpty) {
        edit.ensureReplaced(existing.single, card);
      } else {
        final backRow =
            ff.Pages.partnerListingOverviewPage.widgets.all
                .where((widget) => widget.name == 'WorkspaceMenuRow')
                .last;
        edit.ensureInsertedBefore(backRow, card);
      }
    });
  }

  void _replaceRequestList(
    ProjectPageHandle page, {
    required String target,
    required String heading,
  }) {
    app.editPage(page, (edit) {
      final existing =
          page.widgets.all
              .where((widget) => widget.name == 'WorkspaceRecordList')
              .single;
      edit.ensureReplaced(
        existing,
        ListView(
          name: 'WorkspaceRecordList',
          source: State('rows'),
          spacing: 12,
          itemBuilder:
              (item) => Container(
                name: 'BookingRequestCard',
                padding: const EdgeInsets.all(16),
                borderRadius: 8,
                color: Colors.secondaryBackground,
                borderColor: Colors.alternate,
                borderWidth: 1,
                onTap: Navigate(
                  workspacePage(target),
                  params: {'id': item['id'], 'businessId': item['businessId']},
                ),
                child: Column(
                  crossAxis: CrossAxis.start,
                  spacing: 10,
                  children: [
                    Row(
                      spacing: 10,
                      children: [
                        Expanded(
                          Text(
                            item['title'],
                            style: Styles.titleMedium,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        statusBadge(label: item['status']),
                      ],
                    ),
                    Text(
                      item['subtitle'],
                      style: Styles.bodyMedium,
                      color: Colors.secondaryText,
                      maxLines: 2,
                    ),
                    Row(
                      spacing: 8,
                      children: [
                        const Icon(
                          'group_outlined',
                          size: 18,
                          color: Colors.tertiary,
                        ),
                        Text(item['value'], style: Styles.labelMedium),
                        Spacer(),
                        const Icon(
                          'chevron_right',
                          size: 22,
                          color: Colors.secondaryText,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
        ),
      );
      final label = page.widgets.all.where(
        (widget) => widget.type == 'Text' && widget.text == 'Records',
      );
      if (label.isNotEmpty) {
        edit.ensureReplaced(
          label.single,
          Text(
            heading,
            name: 'WorkspaceListHeading',
            style: Styles.titleMedium,
          ),
        );
      }
    });
  }

  void _enhanceRequestDetail(ProjectPageHandle page, {required bool partner}) {
    app.editPage(page, (edit) {
      final facts = Container(
        name: 'RequestFactsCard',
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 10,
          children: [
            Text('Request details', style: Styles.titleMedium),
            _detailLine('event_outlined', State('field5')),
            _detailLine('schedule_outlined', State('field6')),
            _detailLine('group_outlined', State('partySize')),
            Text(
              State('field4'),
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
              visible: Not(Equals(State('field4'), '')),
            ),
          ],
        ),
      );
      final contact = Container(
        name: partner ? 'CustomerContactCard' : 'ConfirmedPartnerContactCard',
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        borderRadius: 8,
        color: Colors.secondaryBackground,
        borderColor: Colors.alternate,
        borderWidth: 1,
        visible:
            partner
                ? Not(Equals(State('contactName'), ''))
                : Equals(State('status'), 'confirmed'),
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 10,
          children: [
            Text(
              partner ? 'Customer contact' : 'Confirmed partner contact',
              style: Styles.titleMedium,
            ),
            Text(State('contactName'), style: Styles.bodyLarge),
            Text(
              State('contactEmail'),
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
              visible: Not(Equals(State('contactEmail'), '')),
            ),
            Text(
              State('contactPhone'),
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
              visible: Not(Equals(State('contactPhone'), '')),
            ),
            Text(
              State('venueAddress'),
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
              visible: Not(Equals(State('venueAddress'), '')),
            ),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Button(
                  'Email',
                  icon: 'mail_outline',
                  height: 48,
                  variant: ButtonVariant.outlined,
                  visible: Not(Equals(State('contactEmailUrl'), '')),
                  onTap: LaunchUrl(State('contactEmailUrl')),
                ),
                Button(
                  'Call',
                  icon: 'phone_outlined',
                  height: 48,
                  variant: ButtonVariant.outlined,
                  visible: Not(Equals(State('contactPhoneUrl'), '')),
                  onTap: LaunchUrl(State('contactPhoneUrl')),
                ),
                if (!partner)
                  Button(
                    'Directions',
                    icon: 'directions_outlined',
                    height: 48,
                    visible: Not(Equals(State('mapUrl'), '')),
                    onTap: LaunchUrl(State('mapUrl')),
                  ),
              ],
            ),
          ],
        ),
      );
      DslWidget? pending;
      if (!partner) {
        pending = Container(
          name: 'PendingPartnerContactNotice',
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          borderRadius: 8,
          color: Colors.secondaryBackground,
          visible: Not(Equals(State('status'), 'confirmed')),
          child: Row(
            spacing: 10,
            children: [
              const Icon(
                'lock_clock_outlined',
                size: 22,
                color: Colors.secondaryText,
              ),
              Expanded(
                Text(
                  'Partner contact and directions unlock after the business confirms availability.',
                  style: Styles.bodySmall,
                  color: Colors.secondaryText,
                ),
              ),
            ],
          ),
        );
      }
      _upsertAfterStatus(
        edit,
        page,
        Column(
          name: 'RequestExperienceSection',
          crossAxis: CrossAxis.start,
          spacing: 12,
          children: [facts, contact, if (pending != null) pending],
        ),
      );
    });
  }

  DslWidget _detailLine(String icon, Object value) => Row(
    spacing: 10,
    children: [
      Icon(icon, size: 20, color: Colors.tertiary),
      Expanded(Text(value, style: Styles.bodyMedium)),
    ],
  );

  void _upsertAfterStatus(
    EditWidgetEditor edit,
    ProjectPageHandle page,
    DslWidget widget,
  ) {
    final existing = page.widgets.all.where((node) => node.name == widget.name);
    if (existing.isNotEmpty) {
      edit.ensureReplaced(existing.single, widget);
    } else {
      edit.ensureInsertedAfter(
        page.widgets.all
            .where((node) => node.name == 'WorkspaceStatusBadge')
            .single,
        widget,
      );
    }
  }

  void build() {
    buildOnboarding();
    buildCustomer();
    buildPartner();
    buildAdmin();
    buildLegalAndHelp();
  }

  void buildOnboarding() {
    page('IntroOnboardingPage', 'GoFunMotion Deals', [
      Image(
        'https://gofunmotion.com/icons/gofunmotion-icon-512.png',
        fit: ImageFit.contain,
        height: 180,
        width: double.infinity,
      ),
      Text('Last-minute fun. Less to spend.', style: Styles.headlineMedium),
      Text(
        'Open spots at local activities, for tonight and the days ahead.',
        style: Styles.bodyLarge,
        color: Colors.secondaryText,
      ),
      command(
        'Browse deals',
        Navigate(ff.Pages.dealsPage),
        icon: 'local_offer_outlined',
      ),
      nav('Set up your account', 'RoleSelectionPage'),
      nav('I already have an account', 'SignInPage'),
    ]);
    if (reuseExistingProject &&
        ff.Pages.all.any((page) => page.name == 'IntroOnboardingPage')) {
      final intro = ff.Pages.introOnboardingPage;
      app.editPage(intro, (edit) {
        edit.update(
          intro.widgets.all.where((widget) => widget.type == 'Image').single,
          (patch) {
            patch.imagePath(
              'https://gofunmotion.com/icons/gofunmotion-icon-512.png',
            );
            patch.imageFit(ImageFit.contain);
          },
        );
      });
    }
    page('RoleSelectionPage', 'Welcome', [
      Text('What brings you here?', style: Styles.headlineSmall),
      nav(
        'Find something fun',
        'CustomerOnboardingPage',
        detail: 'Your city and activity preferences',
      ),
      nav(
        'Fill open spots',
        'BusinessOnboardingPage',
        detail: 'Offer activities and manage booking requests',
      ),
      Button(
        'Continue browsing',
        icon: 'arrow_forward',
        height: 48,
        onTap: Navigate(ff.Pages.dealsPage),
      ),
    ]);
    for (final name in ['CustomerOnboardingPage', 'EditProfilePage']) {
      page(
        name,
        name == 'EditProfilePage' ? 'Edit profile' : 'Your preferences',
        [
          field(1, 'Your name'),
          field(2, 'Phone (optional)'),
          cityChooser(),
          command(
            'Save profile',
            save(
              'profile',
              values: {
                'value1': input(1),
                'value2': input(2),
                'value3': State('cityId'),
              },
              after: 'AccountSettingsPage',
            ),
            icon: 'save_outlined',
          ),
          nav('Notification preferences', 'NotificationSettingsPage'),
        ],
        section: 'profile',
        fields: [1, 2],
        extra:
            (page) => [
              SetState(
                stateRef(page, 'cityId'),
                State(stateRef(page, 'field3')),
              ),
              SetState(
                stateRef(page, 'cityLabel'),
                State(stateRef(page, 'field5')),
              ),
              ...loadCities(page: page),
            ],
      );
    }
    page('BusinessOnboardingPage', 'Become a partner', [
      Text('Turn open spots into plans.', style: Styles.headlineSmall),
      nav(
        '1. Submit your business',
        'PartnerApplyPage',
        detail: 'Business details, city and activity category',
      ),
      nav(
        '2. Check partner access',
        'PartnerDashboardPage',
        detail: 'Your application is reviewed before publishing',
      ),
      nav(
        '3. Manage your first deal',
        'PartnerListingsPage',
        detail: 'Price, date, time and available spots',
      ),
      nav('Partner support', 'SupportPage'),
    ]);
  }

  void buildCustomer() {
    listPage(
      'CustomerRequestsPage',
      'My requests',
      'requests',
      target: 'CustomerRequestDetailPage',
      empty: 'No booking requests yet',
    );
    page('CustomerRequestDetailPage', 'Booking request', [
      ...recordHeader(),
      Text(
        'A request is only confirmed when the partner confirms availability.',
        style: Styles.bodyMedium,
        color: Colors.secondaryText,
      ),
      Toggle(
        label: 'Cancel this request',
        value: State('confirmed'),
        onChanged: SetState('confirmed', WidgetValue()),
        visible: State('canEdit'),
      ),
      command(
        'Confirm cancellation',
        save('request-cancel', reload: 'request'),
        icon: 'event_busy',
        danger: true,
        visible: State('confirmed'),
      ),
      nav(
        'Write a review',
        'WriteReviewPage',
        id: PageParam('id'),
        detail: 'Available after a confirmed booking date',
      ),
      nav('Get help', 'SupportPage'),
    ], section: 'request');
    page('AccountSettingsPage', 'Account settings', [
      nav('Edit profile', 'EditProfilePage'),
      nav('Notifications', 'NotificationSettingsPage'),
      nav('My booking requests', 'CustomerRequestsPage'),
      nav('Help and support', 'SupportPage'),
      nav('Privacy', 'PrivacyPage'),
      nav('Terms', 'TermsPage'),
      nav('Delete account', 'DeleteAccountPage'),
      command('Sign out', [
        const Logout(),
        Navigate(ff.Pages.discoverPage, replaceRoute: true),
      ], icon: 'logout'),
    ]);
    page('NotificationSettingsPage', 'Notifications', [
      Text('Booking updates', style: Styles.titleLarge),
      Toggle(
        label: 'Push notifications',
        value: State('flag'),
        onChanged: SetState('flag', WidgetValue()),
      ),
      Text(
        'In-app notifications remain in your inbox. Device permission is managed in your phone settings.',
        style: Styles.bodyMedium,
        color: Colors.secondaryText,
      ),
      command(
        'Save preference',
        save('notification-settings'),
        icon: 'save_outlined',
      ),
      nav('Notification inbox', 'NotificationsPage'),
    ], section: 'profile');
    listPage(
      'NotificationsPage',
      'Notifications',
      'notifications',
      notification: true,
      empty: 'You are all caught up',
    );
    page('DeleteAccountPage', 'Delete account', [
      Icon('delete_outline', size: 34, color: Colors.error),
      Text('Delete your account permanently?', style: Styles.headlineSmall),
      Text(
        'Your profile, saved items and booking history will be removed. Business owners must close or transfer their business first. Sign in again before continuing.',
        style: Styles.bodyLarge,
      ),
      Toggle(
        label: 'I understand this cannot be undone',
        value: State('confirmed'),
        onChanged: SetState('confirmed', WidgetValue()),
      ),
      command(
        'Delete my account',
        [
          If(
            State('confirmed'),
            then: [
              If(
                Not(State('busy')),
                then: [
                  SetState('busy', true),
                  ApiCall(
                    api.deleteAccount,
                    outputAs: 'deleteAccountResult',
                    params: {'token': const AuthUser(AuthUserField.jwtToken)},
                    onSuccess:
                        (result) => [
                          const Logout(),
                          Navigate(ff.Pages.discoverPage, replaceRoute: true),
                        ],
                    onFailure: [
                      SetState('busy', false),
                      SetState(
                        'message',
                        'Account not deleted. Sign out and sign in again. Business owners need support to close or transfer their business.',
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
        icon: 'delete_forever',
        danger: true,
        visible: State('confirmed'),
      ),
      nav('Contact support', 'SupportPage'),
    ]);
    page(
      'DealsMapPage',
      'Activity map',
      [
        cityChooser(),
        command('Show activities', [
          SetState('cursor', ''),
          SetState('mapUrl', ''),
          ...load('map'),
        ], icon: 'search'),
        Container(
          height: 220,
          visible: Not(Equals(State('mapUrl'), '')),
          child: WebView(url: State('mapUrl'), height: 220),
        ),
        emptyBlock(
          label: 'No live offers with a map location in this area',
          visible: State('empty'),
        ),
        Expanded(rows(map: true)),
      ],
      section: 'map',
      scrollable: false,
      extra: (page) => loadCities(page: page),
    );
    listPage(
      'ListingReviewsPage',
      'Activity reviews',
      'reviews',
      empty: 'No published reviews yet',
    );
    page(
      'WriteReviewPage',
      'Your experience',
      [
        ...recordHeader(),
        Column(
          visible: State('flag'),
          crossAxis: CrossAxis.start,
          spacing: 14,
          children: [
            Dropdown(
              name: 'ReviewRating',
              label: 'Rating',
              options: const ['5', '4', '3', '2', '1'],
              value: State('field1'),
              onChanged: SetState('field1', WidgetValue()),
            ),
            field(4, 'What was your experience like?', lines: 5),
            command(
              'Submit review',
              save(
                'review-submit',
                values: {'value1': State('field1'), 'value4': input(4)},
              ),
              icon: 'rate_review_outlined',
            ),
          ],
        ),
        Text(
          'Reviews open after your confirmed activity date. Each booking can receive one review, subject to moderation.',
          style: Styles.bodyMedium,
          color: Colors.secondaryText,
        ),
      ],
      section: 'review-request',
      extra: (page) => [SetState(stateRef(page, 'field1'), '5')],
    );
  }

  void buildPartner() {
    listPage(
      'PartnerInboxPage',
      'Booking inbox',
      'partner-inbox',
      target: 'PartnerRequestDetailPage',
      empty: 'No booking requests for this business',
    );
    page('PartnerRequestDetailPage', 'Customer request', [
      ...recordHeader(),
      Column(
        visible: State('canEdit'),
        spacing: 12,
        children: [
          Dropdown(
            name: 'NextBookingStatus',
            label: 'New status',
            options: const ['contacted', 'confirmed', 'cancelled', 'rejected'],
            value: State('nextStatus'),
            onChanged: [
              SetState('nextStatus', WidgetValue()),
              SetState('confirmed', false),
            ],
          ),
          Toggle(
            label: 'Confirm this status change',
            value: State('confirmed'),
            onChanged: SetState('confirmed', WidgetValue()),
          ),
          command(
            'Update booking status',
            save(
              'partner-status',
              values: {'value1': State('nextStatus')},
              reload: 'partner-request',
            ),
            icon: 'edit_calendar',
            visible: State('confirmed'),
          ),
        ],
      ),
      nav('Back to inbox', 'PartnerInboxPage'),
    ], section: 'partner-request');
    listPage(
      'PartnerListingsPage',
      'Your deals',
      'partner-listings',
      target: 'PartnerListingOverviewPage',
      before: [
        command(
          'Create last-minute deal',
          Navigate(
            ff.Pages.partnerDealEditorPage,
            params: {
              'businessId': State('businessId'),
              'listingId': '',
              'initialTitle': '',
              'initialDescription': '',
              'initialCategory': '',
              'initialOriginalPrice': '',
              'initialPrice': '',
              'initialSpots': '',
              'initialStartMillis': 0,
              'initialEndMillis': 0,
            },
          ),
          icon: 'add',
        ),
      ],
      empty: 'Your first deal starts here',
    );
    // Existing editor requires a populated record, not just a listing ID. The
    // overview fetches the current listing before launching the existing editor.
    buildPartnerListingOverview();
    page('PartnerSettingsPage', 'Business settings', [
      nav('Business profile', 'PartnerBusinessProfilePage'),
      nav('Subscription', 'PartnerSubscriptionPage'),
      nav('Team roster', 'PartnerTeamPage'),
      nav('Analytics', 'PartnerAnalyticsPage'),
      nav('Booking inbox', 'PartnerInboxPage'),
      nav('Account settings', 'AccountSettingsPage'),
    ], section: 'business');
    page(
      'PartnerBusinessProfilePage',
      'Business profile',
      [
        field(1, 'Business name'),
        field(2, 'Phone'),
        field(3, 'Website (https://)'),
        field(4, 'About your business', lines: 4),
        field(5, 'Street address'),
        field(6, 'Postal code'),
        Text(
          State('summary'),
          style: Styles.bodyMedium,
          color: Colors.secondaryText,
        ),
        command(
          'Save business profile',
          save(
            'business-profile',
            values: {for (var i = 1; i <= 6; i++) 'value$i': input(i)},
          ),
          icon: 'save_outlined',
        ),
      ],
      section: 'business',
      fields: [1, 2, 3, 4, 5, 6],
    );
    page(
      'PartnerSubscriptionPage',
      'Your subscription',
      [
        ...recordHeader(),
        Expanded(rows()),
        nav(
          'Billing support',
          'SupportPage',
          detail: 'Questions about your current subscription',
        ),
      ],
      section: 'subscription',
      scrollable: false,
    );
    listPage(
      'PartnerAnalyticsPage',
      'Business analytics',
      'analytics',
      metrics: true,
      before: [
        Text(
          State('summary'),
          style: Styles.bodyMedium,
          color: Colors.secondaryText,
        ),
        nav('Your subscription', 'PartnerSubscriptionPage'),
      ],
    );
    page(
      'PartnerTeamPage',
      'Team roster',
      [
        Text(
          State('summary'),
          style: Styles.bodyMedium,
          color: Colors.secondaryText,
        ),
        command(
          'Add team member',
          Navigate(
            workspacePage('PartnerTeamMemberPage'),
            params: {'businessId': State('businessId')},
          ),
          icon: 'person_add_outlined',
          visible: State('canEdit'),
        ),
        Expanded(
          ListView(
            source: State('rows'),
            spacing: 12,
            itemBuilder:
                (item) => Container(
                  padding: 16,
                  color: Colors.secondaryBackground,
                  borderRadius: 8,
                  child: Column(
                    crossAxis: CrossAxis.start,
                    spacing: 8,
                    children: [
                      Text(item['title'], style: Styles.titleMedium),
                      Text(item['subtitle'], style: Styles.bodyMedium),
                      Text(
                        item['detail'],
                        style: Styles.bodyMedium,
                        color: Colors.secondaryText,
                      ),
                      Button(
                        'Remove from roster',
                        icon: 'person_remove_outlined',
                        height: 44,
                        variant: ButtonVariant.outlined,
                        onTap: save(
                          'team-remove',
                          values: {'id': item['id']},
                          reload: 'team',
                        ),
                      ),
                    ],
                  ),
                ),
          ),
        ),
        nav('Subscription', 'PartnerSubscriptionPage'),
      ],
      section: 'team',
      scrollable: false,
    );
    page('PartnerTeamMemberPage', 'Add team member', [
      Text('Business contact', style: Styles.titleLarge),
      field(1, 'Name'),
      field(2, 'Contact email', keyboard: Keyboard.email),
      field(3, 'Role or specialty'),
      Text(
        'This adds a roster contact, not a new sign-in or administrator.',
        style: Styles.bodyMedium,
        color: Colors.secondaryText,
      ),
      command(
        'Save team member',
        save(
          'team-save',
          values: {'value1': input(1), 'value2': input(2), 'value3': input(3)},
          after: 'PartnerTeamPage',
        ),
        icon: 'person_add_outlined',
        visible: State('canEdit'),
      ),
      nav('Subscription', 'PartnerSubscriptionPage'),
    ], section: 'team');
  }

  void buildPartnerListingOverview() {
    page('PartnerListingOverviewPage', 'Deal overview', [
      ...recordHeader(),
      command(
        'Edit deal',
        Navigate(
          ff.Pages.partnerDealEditorPage,
          params: {
            'businessId': State('businessId'),
            'listingId': PageParam('id'),
            'initialTitle': State('field1'),
            'initialDescription': State('field4'),
            'initialCategory': State('field3'),
            'initialPrice': State('field2'),
            'initialOriginalPrice': State('field5'),
            'initialSpots': State('field6'),
            'initialStartMillis': State('startMillis'),
            'initialEndMillis': State('endMillis'),
          },
        ),
        icon: 'edit_outlined',
      ),
      nav('Booking inbox', 'PartnerInboxPage'),
    ], section: 'partner-listing');
  }

  void buildAdmin() {
    final queues = <(String, String, String, String?)>[
      (
        'AdminApplicationsPage',
        'Partner applications',
        'admin-applications',
        'AdminApplicationDetailPage',
      ),
      (
        'AdminListingsPage',
        'Listing review',
        'admin-listings',
        'AdminListingDetailPage',
      ),
      (
        'AdminBusinessesPage',
        'Businesses',
        'admin-businesses',
        'AdminBusinessDetailPage',
      ),
      ('AdminUsersPage', 'Accounts', 'admin-users', 'AdminUserDetailPage'),
      (
        'AdminBookingsPage',
        'All booking requests',
        'admin-bookings',
        'AdminBookingDetailPage',
      ),
      (
        'AdminReviewsPage',
        'Review moderation',
        'admin-reviews',
        'AdminReviewDetailPage',
      ),
      ('AdminAuditLogPage', 'Admin audit log', 'admin-audit', null),
    ];
    for (final queue in queues)
      listPage(
        queue.$1,
        queue.$2,
        queue.$3,
        target: queue.$4,
        empty: 'No records in this queue',
      );
    page(
      'AdminApplicationDetailPage',
      'Review application',
      [
        ...recordHeader(),
        field(2, 'Registered owner email', keyboard: Keyboard.email),
        command('Find owner account', [
          ApiCall(
            api.lookup,
            outputAs: 'applicationOwnerLookup',
            params: {
              'token': const AuthUser(AuthUserField.jwtToken),
              'email': input(2),
            },
            onSuccess:
                (result) => [
                  SetState('ownerUid', result['uid']),
                  SetState('ownerEmail', result['email']),
                ],
            onFailure: [
              SetState('ownerUid', ''),
              SetState('message', 'No registered owner found for that email.'),
            ],
          ),
        ], icon: 'person_search_outlined'),
        Text(State('ownerEmail'), style: Styles.bodyMedium),
        Toggle(
          label: 'I reviewed this business and owner',
          value: State('confirmed'),
          onChanged: SetState('confirmed', WidgetValue()),
        ),
        command(
          'Approve and create business',
          [
            If(
              Not(State('busy')),
              then: [
                SetState('busy', true),
                ApiCall(
                  api.approve,
                  outputAs: 'applicationApproval',
                  params: {
                    'token': const AuthUser(AuthUserField.jwtToken),
                    'applicationId': PageParam('id'),
                    'ownerUid': State('ownerUid'),
                  },
                  onSuccess:
                      (result) => [
                        SetState('busy', false),
                        SetState(
                          'message',
                          'Business created and linked to the owner.',
                        ),
                        SetState('businessId', result['businessId']),
                        SetState('confirmed', false),
                      ],
                  onFailure: [
                    SetState('busy', false),
                    SetState(
                      'message',
                      'Application was not approved. Verify the owner and application status.',
                    ),
                  ],
                ),
              ],
            ),
          ],
          visible: State('confirmed'),
          icon: 'verified_outlined',
        ),
        nav(
          'Open business record',
          'AdminBusinessDetailPage',
          id: State('businessId'),
        ),
        field(4, 'Review reason', lines: 3),
        command(
          'Reject application',
          save(
            'admin-application-reject',
            values: {'value4': input(4)},
            reload: 'admin-application',
          ),
          danger: true,
          icon: 'block',
        ),
      ],
      section: 'admin-application',
      fields: [2],
    );
    page('AdminListingDetailPage', 'Review listing', [
      ...recordHeader(),
      field(4, 'Moderation reason', lines: 3),
      for (final entry
          in {
            'approve': 'Approve and publish',
            'reject': 'Reject listing',
            'pause': 'Pause listing',
            'feature': 'Feature listing',
            'unfeature': 'Remove feature',
            'promote': 'Promote listing',
            'unpromote': 'Remove promotion',
          }.entries)
        command(
          entry.value,
          [
            If(
              Not(State('busy')),
              then: [
                SetState('busy', true),
                ApiCall(
                  api.moderate,
                  outputAs: 'moderation${entry.key}',
                  params: {
                    'token': const AuthUser(AuthUserField.jwtToken),
                    'listingId': PageParam('id'),
                    'action': entry.key,
                    'reason': input(4),
                  },
                  onSuccess:
                      (result) => [
                        SetState('busy', false),
                        SetState('message', 'Listing updated.'),
                        ...load('admin-listing'),
                      ],
                  onFailure: [
                    SetState('busy', false),
                    SetState(
                      'message',
                      'Listing not changed. Check approval status and subscription eligibility.',
                    ),
                  ],
                ),
              ],
            ),
          ],
          icon: entry.key == 'approve' ? 'verified_outlined' : 'edit_outlined',
          danger: entry.key == 'reject',
        ),
    ], section: 'admin-listing');
    page('AdminBusinessDetailPage', 'Review business', [
      ...recordHeader(),
      field(4, 'Moderation reason', lines: 3),
      for (final entry
          in {
            'approved': 'Approve business',
            'rejected': 'Reject business',
            'suspended': 'Suspend business',
          }.entries)
        command(
          entry.value,
          save(
            'admin-business-status',
            values: {'value1': entry.key, 'value4': input(4)},
            reload: 'admin-business',
          ),
          icon: 'business_outlined',
          danger: entry.key != 'approved',
        ),
    ], section: 'admin-business');
    page('AdminUserDetailPage', 'Account record', [
      ...recordHeader(),
      Text(State('field2'), style: Styles.bodyLarge),
      Text(State('field5'), style: Styles.bodyMedium),
      Text(
        'Role and administrator access are managed through the protected server workflow.',
        style: Styles.bodyMedium,
        color: Colors.secondaryText,
      ),
      nav('Back to accounts', 'AdminUsersPage'),
    ], section: 'admin-user');
    page('AdminBookingDetailPage', 'Booking overview', [
      ...recordHeader(),
      nav('All booking requests', 'AdminBookingsPage'),
    ], section: 'admin-booking');
    page('AdminReviewDetailPage', 'Review moderation', [
      ...recordHeader(),
      field(4, 'Moderation note', lines: 3),
      for (final entry
          in {
            'approved': 'Publish review',
            'rejected': 'Reject review',
            'hidden': 'Hide review',
          }.entries)
        command(
          entry.value,
          save(
            'admin-review-status',
            values: {'value1': entry.key, 'value4': input(4)},
            reload: 'admin-review',
          ),
          icon: 'rate_review_outlined',
          danger: entry.key != 'approved',
        ),
    ], section: 'admin-review');
    listPage(
      'AdminCitiesPage',
      'Cities',
      'admin-cities',
      target: 'AdminCityEditorPage',
      before: [nav('Add city', 'AdminCityEditorPage')],
    );
    listPage(
      'AdminCategoriesPage',
      'Categories',
      'admin-categories',
      target: 'AdminCategoryEditorPage',
      before: [nav('Add category', 'AdminCategoryEditorPage')],
    );
    page(
      'AdminCityEditorPage',
      'City settings',
      [
        field(1, 'City name'),
        field(2, 'State / region'),
        field(3, 'IANA time zone'),
        field(4, 'Description', lines: 3),
        Text(
          'United States',
          style: Styles.bodyMedium,
          color: Colors.secondaryText,
        ),
        Toggle(
          label: 'Active city',
          value: State('flag'),
          onChanged: SetState('flag', WidgetValue()),
        ),
        command(
          'Save city',
          save(
            'admin-city-save',
            values: {for (var i = 1; i <= 4; i++) 'value$i': input(i)},
          ),
          icon: 'save_outlined',
        ),
      ],
      section: 'admin-city',
      fields: [1, 2, 3, 4],
    );
    page(
      'AdminCategoryEditorPage',
      'Category settings',
      [
        field(1, 'Category name'),
        field(4, 'Description', lines: 3),
        Toggle(
          label: 'Active category',
          value: State('flag'),
          onChanged: SetState('flag', WidgetValue()),
        ),
        command(
          'Save category',
          save(
            'admin-category-save',
            values: {'value1': input(1), 'value4': input(4)},
          ),
          icon: 'save_outlined',
        ),
      ],
      section: 'admin-category',
      fields: [1, 4],
    );
    listPage(
      'AdminMetricsPage',
      'Marketplace metrics',
      'admin-metrics',
      metrics: true,
      before: [
        Text(
          'Live counts. Booking requests are not sales.',
          style: Styles.bodyMedium,
          color: Colors.secondaryText,
        ),
      ],
    );
  }

  void buildLegalAndHelp() {
    page('SupportPage', 'Help and support', [
      nav(
        'AI support',
        'AiSupportPage',
        detail: 'Answers about requests, accounts and partner workflows',
      ),
      Text('A request is not a confirmed booking', style: Styles.titleMedium),
      Text(
        'Wait for the partner to confirm the time and availability. Never send card details through a booking message.',
        style: Styles.bodyLarge,
      ),
      nav('My requests', 'CustomerRequestsPage'),
      nav('Partner onboarding', 'BusinessOnboardingPage'),
      command(
        'Contact support',
        LaunchUrl('https://gofunmotion.com/support'),
        icon: 'support_agent',
      ),
      nav('Privacy', 'PrivacyPage'),
      nav('Terms', 'TermsPage'),
    ]);
    page('PrivacyPage', 'Privacy', [
      Text('Your data and choices', style: Styles.headlineSmall),
      Text(
        'Account information supports sign-in, saved activities and booking requests. Request details are shared with the relevant business. AI help is optional and requires consent before sending your prompt and relevant activity information to OpenAI.',
        style: Styles.bodyLarge,
      ),
      nav('Notification preferences', 'NotificationSettingsPage'),
      nav('Delete account', 'DeleteAccountPage'),
      command(
        'Read the full privacy policy',
        LaunchUrl('https://gofunmotion.com/privacy'),
        icon: 'open_in_new',
      ),
    ]);
    page('TermsPage', 'Terms', [
      Text('Before you book', style: Styles.headlineSmall),
      Text(
        'GoFunMotion helps you discover activities. Businesses fulfill the experiences. Prices and availability can change. A booking request is not a confirmation. Partner terms apply to the activity; no consumer payment is collected in this app.',
        style: Styles.bodyLarge,
      ),
      command(
        'Read the full terms',
        LaunchUrl('https://gofunmotion.com/terms'),
        icon: 'open_in_new',
      ),
      nav('Get help', 'SupportPage'),
    ]);
  }

  void wireExistingEntries() {
    final entries = <ProjectPageHandle, List<DslWidget>>{
      ff.Pages.profilePage: [
        nav('My booking requests', 'CustomerRequestsPage'),
        nav('Notifications', 'NotificationsPage'),
        nav('Account settings', 'AccountSettingsPage'),
        nav('Set up preferences', 'CustomerOnboardingPage'),
      ],
      ff.Pages.partnerDashboardPage: [
        nav('Manage deals', 'PartnerListingsPage'),
        nav('Booking inbox', 'PartnerInboxPage'),
        nav('Business analytics', 'PartnerAnalyticsPage'),
        nav('Business settings', 'PartnerSettingsPage'),
      ],
      ff.Pages.discoverPage: [
        nav('Activity map', 'DealsMapPage'),
        nav('Welcome to GoFunMotion', 'IntroOnboardingPage'),
      ],
      ff.Pages.savedPage: [
        nav('Booking request details', 'CustomerRequestsPage'),
      ],
    };
    for (final entry in entries.entries) {
      app.editPageState(entry.key, (s) {
        s.ensureField('businessId', string.withDefault(''));
      });
      app.editPage(entry.key, (pageEdit) {
        final body = entry.key.widgets.root.slots['body']!.single;
        pageEdit.ensureInsertedInto(
          body,
          Column(
            name: 'NativeWorkspaceNavigation',
            crossAxis: CrossAxis.start,
            spacing: 10,
            children: entry.value,
          ),
        );
      });
    }
    app.editPageState(ff.Pages.adminPage, (s) {
      s.ensureField('businessId', string.withDefault(''));
      s.ensureField('isAdmin', bool_.withDefault(false));
    });
    app.editPageOnLoad(ff.Pages.adminPage, [
      SetState(ff.Pages.adminPage.state.isAdmin, false),
      SetState.clear(ff.Pages.adminPage.state.applications),
      SetState.clear(ff.Pages.adminPage.state.adminListings),
      If(
        const Global(GlobalProperty.isUserLoggedIn),
        then: [
          ApiCall(
            api.access,
            outputAs: 'nativeAdminAccess',
            params: {'token': const AuthUser(AuthUserField.jwtToken)},
            onSuccess: (result) => [SetState('isAdmin', result['isAdmin'])],
            onFailure: [
              Snackbar(
                'Administrator access could not be verified. Please sign in again.',
              ),
            ],
          ),
        ],
      ),
    ]);
    app.editPage(ff.Pages.adminPage, (edit) {
      for (final key in ['ListView_sh90m1dy', 'ListView_20dqsmgf']) {
        edit.bindVisible(
          ff.Pages.adminPage.widgets.byKey(key).single,
          const Literal(false),
        );
      }
      final old = ff.Pages.adminPage.widgets.all.where(
        (widget) => widget.name == 'AdminReviewIntro',
      );
      if (old.isNotEmpty)
        edit.ensureReplaced(
          old.single,
          Column(
            name: 'AdminReviewIntro',
            visible: State('isAdmin'),
            crossAxis: CrossAxis.start,
            spacing: 12,
            children: [
              Text('Marketplace operations', style: Styles.headlineSmall),
              for (final target in <(String, String)>[
                ('Partner applications', 'AdminApplicationsPage'),
                ('Listing review', 'AdminListingsPage'),
                ('Businesses', 'AdminBusinessesPage'),
                ('Accounts', 'AdminUsersPage'),
                ('Booking requests', 'AdminBookingsPage'),
                ('Review moderation', 'AdminReviewsPage'),
                ('Cities', 'AdminCitiesPage'),
                ('Categories', 'AdminCategoriesPage'),
                ('Metrics', 'AdminMetricsPage'),
                ('Audit log', 'AdminAuditLogPage'),
              ])
                nav(target.$1, target.$2),
            ],
          ),
        );
    });
    app.editPage(ff.Pages.dealDetailPage, (edit) {
      final body = ff.Pages.dealDetailPage.widgets.root.slots['body']!.single;
      edit.ensureInsertedInto(
        body,
        Button(
          'Activity reviews',
          icon: 'star_outline',
          height: 48,
          name: 'OpenNativeListingReviews',
          onTap: Navigate(
            workspacePage('ListingReviewsPage'),
            params: {
              'id': State(ff.Pages.dealDetailPage.state.listing)['id'],
              'businessId': '',
            },
          ),
        ),
      );
    });
  }
}
