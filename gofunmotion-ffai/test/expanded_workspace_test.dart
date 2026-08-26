import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/api_helpers.dart'
    show findApiEndpoint;
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import 'package:test/test.dart';
import '../dsl/create.dart' as original;
import '../dsl/ai_experience.dart' as ai;
import '../dsl/expanded_workspace.dart';
import '../lib/flutterflow_project.dart' as ff;

void main() {
  late FFProject project;
  setUpAll(() {
    project =
        compileApp(
          buildApp((app) {
            original.buildGoFunMotionDeals(app);
            final native = ai.declareNativeAiApi(app, ff.Collections.listings);
            ai.ensureNativeAssistantPage(app, native);
            ai.ensureNativeSupportPage(app, native);
            app.ensurePage(
              'PartnerDealEditorPage',
              route: '/partner-deal-editor',
              params: {
                for (final name in [
                  'businessId',
                  'listingId',
                  'initialTitle',
                  'initialDescription',
                  'initialCategory',
                  'initialPrice',
                  'initialOriginalPrice',
                  'initialSpots',
                ])
                  name: string.withDefault(''),
                'initialStartMillis': int_.withDefault(0),
                'initialEndMillis': int_.withDefault(0),
              },
              body: Scaffold(body: Text('Existing editor')),
            );
            NativeWorkspaceScreens(
              app,
              declareWorkspaceApi(app),
              native,
              reuseExistingProject: false,
            ).build();
          }),
        ).project;
    configureExpandedWorkspace(project);
  });

  test(
    'All requested journeys have real native pages, bringing the app above 45',
    () {
      expect(project.pageKeys.length, greaterThanOrEqualTo(45));
      expect(expandedPageNames.toSet(), hasLength(expandedPageNames.length));
      for (final name in expandedPageNames) {
        final page = findPage(project, name: name);
        expect(page, isNotNull, reason: name);
        expect(
          findDescendants(
            page!.node,
            (node) => node.name == 'WorkspaceReadyContent',
          ),
          hasLength(1),
        );
        expect(
          page.params.length,
          2,
          reason: 'Default-safe id and businessId on $name',
        );
      }
    },
  );

  test(
    'Every private page checks account access and admin pages require admin response',
    () {
      for (final name in expandedPageNames.where(
        (name) => !workspacePublicPages.contains(name),
      )) {
        final page = findPage(project, name: name)!;
        final actions = page.node.triggerActions.toString();
        expect(actions, contains('workspaceAccess'), reason: name);
        if (name.startsWith('Admin'))
          expect(actions, contains('isAdmin'), reason: name);
      }
    },
  );

  test('Data lists are native and paginated', () {
    for (final name in [
      'CustomerRequestsPage',
      'PartnerInboxPage',
      'AdminApplicationsPage',
      'AdminAuditLogPage',
    ]) {
      final page = findPage(project, name: name)!;
      final list =
          findDescendants(
            page.node,
            (node) => node.name == 'WorkspaceRecordList',
          ).single;
      expect(list.type, FFWidgetType.ListView);
      expect(page.node.toProto3Json().toString(), contains('nextCursor'));
    }
  });

  test(
    'Destructive account and booking actions require visible confirmation',
    () {
      for (final name in ['DeleteAccountPage', 'CustomerRequestDetailPage']) {
        final page = findPage(project, name: name)!;
        expect(
          findDescendants(
            page.node,
            (node) => node.type == FFWidgetType.Switch,
          ),
          isNotEmpty,
        );
        expect(page.node.toProto3Json().toString(), contains('confirmed'));
      }
    },
  );

  test('UI stays native with reusable components and no provider secrets', () {
    for (final name in expandedPageNames) {
      final page = findPage(project, name: name)!;
      expect(
        findDescendants(
          page.node,
          (node) => node.type.name.contains('CustomWidget'),
        ),
        isEmpty,
      );
      expect(page.node.toProto3Json().toString(), isNot(contains('sk-')));
    }
    expect(findComponent(project, name: 'WorkspaceMenuRow'), isNotNull);
  });

  test('List state keeps its struct identity after normalization', () {
    for (final name in expandedPageNames) {
      final page = findPage(project, name: name)!;
      for (final field in page.classModel.stateFields.where(
        (field) => ['rows', 'cities'].contains(field.parameter.identifier.name),
      )) {
        expect(field.parameter.isList, isTrue);
        expect(
          field.parameter.dataType.subType.dataStructIdentifier.key,
          isNotEmpty,
        );
      }
    }
  });

  test('Pages are organized without replacing manual Builder folders', () {
    final page = findPage(project, name: 'PartnerInboxPage')!;
    final folders = project.codeGenerationSettings;
    expect(
      folders.widgetClassKeyToFolderKey[page.node.key],
      'gfm_native_partner',
    );
    folders.widgetClassKeyToFolderKey[page.node.key] = 'manual_folder';
    configureExpandedWorkspace(project);
    expect(folders.widgetClassKeyToFolderKey[page.node.key], 'manual_folder');
    expect(
      folders.rootFolders.where(
        (folder) => folder.key.startsWith('gfm_native_'),
      ),
      hasLength(6),
    );
  });

  test(
    'Read API uses encoded native query parameters, not URL interpolation',
    () {
      final endpoint =
          findApiEndpoint(
            project,
            name: 'ReadNativeWorkspace',
            groupName: 'GoFunMotionWorkspace',
          )!;
      expect(endpoint.url, '/api/mobile/workspace');
      expect(
        endpoint.parameters.map((parameter) => parameter.identifier.name),
        containsAll(['section', 'id', 'businessId', 'cursor', 'cityId']),
      );
      expect(
        endpoint.parameters.every(
          (parameter) => parameter.hasVariableIdentifier(),
        ),
        isTrue,
      );
    },
  );
}
