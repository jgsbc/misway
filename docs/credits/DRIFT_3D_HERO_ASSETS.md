# DRIFT 3D — Hero asset provenance

This file records third-party authored assets that are actually rendered in MISWAY DRIFT. Runtime placement and policy live in `src/lib/drift3dBirthYardHeroAssets.ts`.

## Birth Yard Hero Asset Pass 01–02

### Delivery truck geometry

- Source: KhronosGroup/glTF-Sample-Assets — `CesiumMilkTruck`
- Pinned source revision: `2bac6f8c57bf471df0d2a1e8a8ec023c7801dddf`
- Original author/owner: Cesium (2017)
- License: CC BY 4.0 with Cesium trademark limitations
- MISWAY policy: geometry only. Original branded textures/materials are not rendered; neutral MISWAY materials replace them.

### Foreground pedestrian rig

- Source: KhronosGroup/glTF-Sample-Assets — `RiggedFigure`
- Pinned source revision: `2bac6f8c57bf471df0d2a1e8a8ec023c7801dddf`
- Original author/owner: Cesium (2017)
- License: CC BY 4.0 International
- MISWAY policy: only a bounded foreground tier uses the skinned rig/animation. MISWAY owns presentation materials, scale and circulation; procedural instancing remains the mass-crowd layer.

The source revision is immutable in runtime configuration so upstream changes cannot silently alter the accepted visual result.
