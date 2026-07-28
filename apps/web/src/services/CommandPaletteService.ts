import { reactive, ref } from 'vue';

export interface UICommand {
  id: string;
  title: string;
  subtitle?: string;
  keywords: string[];
  icon?: string;
  category: 'Navegação' | 'Ações' | 'Filtros' | 'Workspace';
  execute: () => void;
}

class CommandPaletteServiceImpl {
  public isOpen = ref(false);
  public searchQuery = ref('');
  public commands = reactive<UICommand[]>([]);

  public open(): void {
    this.isOpen.value = true;
    this.searchQuery.value = '';
  }

  public close(): void {
    this.isOpen.value = false;
    this.searchQuery.value = '';
  }

  public toggle(): void {
    this.isOpen.value = !this.isOpen.value;
    if (!this.isOpen.value) this.searchQuery.value = '';
  }

  public registerCommand(cmd: UICommand): void {
    const idx = this.commands.findIndex((c: UICommand) => c.id === cmd.id);
    if (idx >= 0) {
      this.commands[idx] = cmd;
    } else {
      this.commands.push(cmd);
    }
  }

  public setCommands(cmds: UICommand[]): void {
    this.commands.splice(0, this.commands.length, ...cmds);
  }
}

export const CommandPaletteService = new CommandPaletteServiceImpl();
