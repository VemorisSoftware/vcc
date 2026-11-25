---
name: flutter
description: "ES: Apps Flutter mantenibles: estructura por funcionalidad, estado con Riverpod o Bloc, async seguro con mounted, rendimiento de listas, plataforma y pruebas de widgets. Úsalo al construir o revisar apps Flutter. EN: Maintainable Flutter apps: feature structure, state with Riverpod or Bloc, safe async with mounted, list performance, platform and widget tests. Use when building or reviewing Flutter apps."
---

# Flutter

## Estructura
```
lib/
  funcionalidades/
    facturas/  datos/  dominio/  presentacion/
  compartido/
  main.dart
```

## Estado
Un solo enfoque por app (Riverpod o Bloc). Los widgets muestran estado y emiten eventos; la lógica vive en notifiers/blocs probables sin UI.
```dart
@riverpod
Future<List<Factura>> facturas(Ref ref) => ref.watch(apiProvider).listarFacturas();
```

## Async seguro
```dart
final ok = await repo.guardar(f);
if (!context.mounted) return;
ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ok ? 'Guardado' : 'Error')));
```
`dispose()` para controladores, streams y animaciones.

## Rendimiento
`const` en todo widget que se pueda, `ListView.builder` para listas, imágenes con tamaño y caché, sin trabajo pesado en `build` (usa `compute` o isolates).

## Plataforma
Textos de permisos en `Info.plist` y `AndroidManifest.xml`. Nada secreto dentro de la app: todo lo que va en el binario se puede leer. Llaves de API sensibles detrás de tu backend.

## Pruebas
```dart
testWidgets('muestra el total', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: Total(monto: 15990)));
  expect(find.text(r'$15.990'), findsOneWidget);
});
```
Unitarias para la lógica, de widgets para pantallas y `integration_test` para los flujos críticos.
