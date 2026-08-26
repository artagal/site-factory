import 'package:flutterflow_ai/flutterflow_ai.dart';

// A one-time property migration is separate from API declarations: the SDK's
// ensure helpers deliberately reject changes to existing endpoint settings.
void migrateApiEncoding(FFProject project) {
  for (final group in project.backend.apiConfig.apiGroups) {
    if (![
      'GoFunMotionWeb',
      'GoFunMotionAssistant',
    ].contains(group.identifier.name))
      continue;
    for (final endpoint in group.endpoints) {
      if (!endpoint.endpointSettings.requireAuthentication &&
          endpoint.identifier.name != 'AskGoFunMotion')
        continue;
      final settings = endpoint.ensureEndpointSettings();
      // Materialize the same default-field presence as EndpointSettings codegen.
      // Protobuf equality distinguishes an omitted false from an explicit false.
      settings
        ..cached = settings.cached
        ..requireAuthentication = settings.requireAuthentication
        ..isPrivateApi = settings.isPrivateApi
        ..alwaysAllowBody = settings.alwaysAllowBody
        ..withCredentials = settings.withCredentials
        ..isStreamingApi = settings.isStreamingApi
        ..noProxyForTest = settings.noProxyForTest
        ..noProxyForWeb = settings.noProxyForWeb
        ..escapeVariablesInRequestBody = true
        ..encodeBodyUtf8 = true
        ..decodeUtf8 = true;
    }
  }
}

Future<void> main() async {
  await flutterFlowAI(
    (app) => app.raw(migrateApiEncoding),
    projectId: 'go-fun-motion-deals-vl4mj8',
    commitMessage:
        'Escape mobile JSON variables without replacing API identities',
    validationFilter:
        (error) =>
            !error.message.contains('config file is not uploaded') &&
            !error.message.contains('config files are not uploaded'),
  );
}
