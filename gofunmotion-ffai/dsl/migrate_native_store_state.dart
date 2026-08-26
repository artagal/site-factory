import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/data_schema_helpers.dart'
    show addDataStructField, findDataStruct, findDataStructField;
import 'package:flutterflow_ai/src/helpers/data_type_helpers.dart' as types;

// One-time schema migration. Struct declarations are intentionally strict and
// cannot add fields to a data struct that already exists in FlutterFlow.
void migrateNativeStoreState(FFProject project) {
  if (findDataStruct(project, name: 'NativeStoreState') == null) {
    throw StateError('NativeStoreState must exist before it can be migrated.');
  }

  for (final fieldName in ['canGrowth', 'canPro']) {
    if (findDataStructField(
          project,
          structName: 'NativeStoreState',
          fieldName: fieldName,
        ) ==
        null) {
      addDataStructField(
        project,
        structName: 'NativeStoreState',
        fieldName: fieldName,
        type: types.boolType,
        description: 'NativeStoreState.$fieldName',
      );
    }
  }
}

Future<void> main() async {
  await flutterFlowAI(
    (app) => app.raw(migrateNativeStoreState),
    projectId: 'go-fun-motion-deals-vl4mj8',
    commitMessage: 'Add native subscription plan availability fields',
    validationFilter:
        (error) =>
            !error.message.contains('config file is not uploaded') &&
            !error.message.contains('config files are not uploaded'),
  );
}
