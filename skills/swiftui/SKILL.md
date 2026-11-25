---
name: swiftui
description: "ES: Construir interfaces SwiftUI mantenibles: dónde vive el estado, cómo dividir vistas, navegación tipada, listas rápidas, previews y accesibilidad. Úsalo al crear o revisar pantallas SwiftUI. EN: Building maintainable SwiftUI: where state lives, splitting views, typed navigation, fast lists, previews and accessibility. Use when creating or reviewing SwiftUI screens."
---

# SwiftUI

## ¿Dónde vive el estado?
| Necesito… | Uso |
|---|---|
| Algo que solo esta vista usa (toggle, texto) | `@State` |
| Que un hijo modifique estado del padre | `@Binding` |
| Lógica y datos de una pantalla | clase `@Observable` guardada en `@State` |
| Servicios compartidos (sesión, API) | `@Environment` |

```swift
@Observable @MainActor
final class FacturasModelo {
  private(set) var facturas: [Factura] = []
  private(set) var error: String?
  private let api: FacturasAPI

  init(api: FacturasAPI) { self.api = api }

  func cargar() async {
    do { facturas = try await api.listar() }
    catch { self.error = "No pudimos cargar las facturas." }
  }
}
```

## Dividir vistas
- `body` corto; extrae subvistas con nombre cuando un bloque tiene significado propio.
- La vista muestra y reenvía eventos; el modelo decide.
- Estilos repetidos → `ViewModifier` o `ButtonStyle`.

## Navegación
```swift
enum Destino: Hashable { case factura(Factura.ID), ajustes }

NavigationStack(path: $ruta) {
  Lista()
    .navigationDestination(for: Destino.self) { destino in
      switch destino {
      case .factura(let id): DetalleFactura(id: id)
      case .ajustes: Ajustes()
      }
    }
}
```

## Listas rápidas
`ForEach` con ids estables · `LazyVStack` para contenido largo · nada de cálculos pesados en `body` · carga con `.task { await modelo.cargar() }`, que se cancela sola.

## Previews
Una por estado importante: cargando, vacío, con datos, error. Usa una API falsa inyectada.

## Accesibilidad
Textos con Dynamic Type, `accessibilityLabel` en botones de solo ícono, contraste suficiente, áreas táctiles de al menos 44×44 pt.
