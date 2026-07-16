# DRIFT 3D — Playbook QA et acceptation du monde intégral

- **Version :** 2.0
- **Date :** 2026-07-15
- **Statut :** `ACTIVE`

---

# 1. Principe

Une scène n'est pas acceptée parce qu'elle compile. Elle est acceptée lorsqu'elle raconte la bonne chose, vit sans attendre, réagit à la musique, se réinitialise, fonctionne sur tous les chemins produit, tient ses budgets et est reconnue par le propriétaire.

---

# 2. Axes artistiques

Noter chaque scène de 0 à 4.

| Axe | 0 | 2 | 4 |
|---|---|---|---|
| Lisibilité | lieu incompréhensible | lisible avec effort | lieu compris avant symbole |
| Singularité | interchangeable | signes propres | screenshot impossible ailleurs |
| Intelligence | effet gratuit | métaphore correcte | tension réelle révélée |
| Vie | diorama mort | boucles visibles | trois profondeurs de vie |
| Retenue | tout simultané | hiérarchie partielle | une idée dominante |
| Émotion | aucune | concept compris | émotion avant explication |
| Continuité | isolée | référence légère | arrivée/départ intégrés |
| Loufoquerie | gag | décalage | absurdité précise et juste |

Gate recommandé : aucun axe critique sous 2 ; Singularité, Intelligence et Émotion ≥3.

---

# 3. Matrice fonctionnelle track

| Cas | Attendu |
|---|---|
| arrivée sans track | vie autonome, aucune signature |
| autre track active | aucune dramaturgie locale |
| track explicite | activation bornée |
| pause | gel exact |
| reprise | continuité sans rattrapage |
| seek avant | état antérieur direct |
| seek après | état atteint direct |
| loop | reset/réarmement |
| changement de track | reset |
| sortie | politique documentée |
| retour | résolution courante ou reset documenté |
| reload | état produit cohérent |
| autre page | player global intact |
| no audio | monde lisible |
| ambience off | scène cohérente |

---

# 4. QA vie autonome

- observer 30 secondes sans musique ;
- identifier au moins trois boucles ;
- vérifier qu'elles ne sont pas artificiellement synchrones ;
- observer l'arrière-plan ;
- vérifier culling et arrêt hors distance ;
- comprendre une micro-situation ;
- refuser les boucles purement décoratives.

---

# 5. QA continuité

- l'objet entrant est-il visible sans explication ?
- conserve-t-il une matière ou un geste reconnaissable ?
- son sens change-t-il ?
- repart-il ou laisse-t-il une trace ?
- l'océan peut-il le restituer ?
- la scène reste-t-elle autonome ?
- la mémoire reste-t-elle bornée ?

---

# 6. QA audio

- un seul player ;
- aucun autoplay ;
- next/previous/loop/seek ;
- changement de route ;
- pause longue ;
- seek en pause ;
- fin réelle ;
- retour zéro ;
- cue boundaries ;
- absence de marche visuelle ;
- ambiance duckée ;
- cleanup.

---

# 7. QA performance

Capturer :

- appareil et viewport ;
- quality tier ;
- fps moyen/min ;
- frame time ;
- draw calls ;
- triangles ;
- textures ;
- programmes ;
- callbacks frame ;
- population active ;
- signature ;
- mémoire si accessible.

Tester idle, active, signature, sortie, retour, pire angle, session longue et mobile thermique.

---

# 8. QA mobile

- conduite à une main ;
- contrôles non masqués ;
- HUD lisible ;
- typo diégétique assez grande ;
- signature visible à distance ;
- aucune caméra imposée ;
- pas de détail minuscule indispensable ;
- 30 fps cible ;
- audio unlock ;
- pas de scroll parasite.

---

# 9. QA reduced motion

Chaque track possède :

| Phase | Normal | Reduced motion |
|---|---|---|

Vérifier absence de shake, travelling imposé, pulsation rapide et mouvement agressif. Le sens doit survivre par poses, états, lumière et matériaux.

---

# 10. QA no-WebGL

- route utile ;
- catalogue accessible ;
- contrôle audio ;
- scène représentée honnêtement ;
- contenu statique léger ;
- aucune promesse d'interaction ;
- `basePath` correct ;
- assets exportés.

---

# 11. QA session et mémoire

- session vierge ;
- événement vu ;
- sortie/retour ;
- plusieurs résidus ;
- limite ;
- déduplication ;
- reset/reload ;
- navigation ;
- océan final ;
- absence de stockage personnel ;
- absence de croissance illimitée.

---

# 12. Evidence package

Chaque lot Build/Acceptance fournit :

- fichiers ;
- captures idle/active/signature/aftermath ;
- capture mobile ;
- preuve reduced motion ;
- console ;
- métriques ;
- tests ;
- lint ;
- build ;
- diff check ;
- fichiers protégés ;
- risques ;
- décision propriétaire.

Ne jamais revendiquer une QA non effectuée.

---

# 13. Owner review

```text
Track:
Lot:
Technical:
  ACCEPTED / REWORK_REQUIRED
Artistic:
  ACCEPTED / ACCEPTED_WITH_FOLLOW_UP / REWORK_REQUIRED / REJECTED

The place feels:
The emotion feels:
The singular element is:
Too generic:
Too explicit:
Too subtle:
Performance:
Mobile:
Reduced motion:
Required follow-up:
```

---

# 14. QA d'ère

- toutes les tracks acceptées ;
- transitions entrante/sortante ;
- palette ;
- densité ;
- population ;
- motif récurrent ;
- arrière-plan ;
- textes ;
- route ;
- performance cumulée ;
- aucun objet signature copié ;
- émotion globale perceptible.

---

# 15. QA parcours complet

Parcourir Entry → Birth Yard → Older Shadows → Vegetative Field → New Signal → océan → retour.

Vérifier arc émotionnel, fatigue visuelle, répétitions, mémoire, densité, alternance calme/spectacle, continuité audio, navigation, stabilité, fin non explicative et envie de revisiter.

---

# 16. Release gates

Pas de release candidate si :

- un lot critique est `PENDING_OWNER_REVIEW` ;
- une track n'a pas de fallback ;
- le player régresse ;
- la pire zone échoue sur mobile ;
- la mémoire fuit ;
- l'océan ne reset pas ;
- l'export casse ;
- le texte explique le sens ;
- plusieurs tracks restent génériques ;
- les transitions ressemblent à des raccords techniques.
