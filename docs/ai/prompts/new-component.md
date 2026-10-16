Add <Component> to packages/ui following AGENTS.md.

Figma: <node id>. Spec: the component's .figma-spec.md if one exists.

1. Build it on the matching Base UI primitive (or `shadcn add <name>` with base "base"), then
   restyle to token utilities only, with cva variants named as in Figma.
2. Stories: Default, AllVariants, Sizes, States (hover/focus/disabled/error), light and dark, play
   tests for keyboard behaviour, parameters.design.figmaNode and parameters.ai.{summary,useWhen,avoidWhen}.
3. Run test:storybook (a11y must pass), lint and typecheck; check screenshots in light and dark.
