import { TUI_ICON_RESOLVER } from "@taiga-ui/core";
import { inject } from "@angular/core";

const IconsProvider = {
  provide: TUI_ICON_RESOLVER,
  useFactory: () => {
    const original = inject(TUI_ICON_RESOLVER, { skipSelf: true });

    return (name: string) =>
      name.startsWith("@tui.") ? original(name) : `/assets/icons/${name}.svg`;
  },
};

export { IconsProvider };
