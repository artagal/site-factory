import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/data_schema_helpers.dart'
    show addDataStructField, findDataStruct, findDataStructField;
import 'package:flutterflow_ai/src/helpers/data_type_helpers.dart' as types;

const matureWorkflowFields = [
  'contactName',
  'contactEmail',
  'contactPhone',
  'contactEmailUrl',
  'contactPhoneUrl',
  'mapUrl',
  'venueAddress',
  'partySize',
];

void migrateMatureWorkflowFields(FFProject project) {
  if (findDataStruct(project, name: 'MobileWorkspaceResponse') == null) {
    throw StateError(
      'MobileWorkspaceResponse must exist before it can be migrated.',
    );
  }
  for (final field in matureWorkflowFields) {
    if (findDataStructField(
          project,
          structName: 'MobileWorkspaceResponse',
          fieldName: field,
        ) !=
        null) {
      continue;
    }
    addDataStructField(
      project,
      structName: 'MobileWorkspaceResponse',
      fieldName: field,
      type: types.stringType,
      description: 'MobileWorkspaceResponse.$field',
    );
  }
}

Future<void> main() async {
  await flutterFlowAI(
    (app) => app.raw(migrateMatureWorkflowFields),
    projectId: 'go-fun-motion-deals-vl4mj8',
    commitMessage: 'Add confirmed booking contact fields',
    validationFilter:
        (error) =>
            !error.message.contains('config file is not uploaded') &&
            !error.message.contains('config files are not uploaded'),
  );
}
