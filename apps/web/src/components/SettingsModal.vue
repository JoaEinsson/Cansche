<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="close"
  >
    <div class="w-full max-w-4xl h-[min(680px,calc(100vh-2rem))] flex overflow-hidden bg-[#0f1011] border border-[#23252a] rounded-[12px] shadow-2xl">
      <aside class="w-56 shrink-0 border-r border-[#23252a] bg-[#08090a] p-3 flex flex-col">
        <div class="px-2 py-2 mb-3">
          <div class="flex items-center gap-2 text-white font-semibold text-sm">
            <IconRenderer icon="lucide:Settings" :size="16" color="#02b8cc" />
            Configurações
          </div>
          <p class="text-[10px] text-[#62666d] mt-1">Preferências locais do aplicativo</p>
        </div>

        <nav class="space-y-1">
          <button v-for="item in sections" :key="item.id" @click="activeSection = item.id" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-xs text-left transition-colors" :class="activeSection === item.id ? 'bg-[#161718] text-white border border-[#383b3f]' : 'text-[#8a8f98] hover:bg-[#0f1011] hover:text-white border border-transparent'">
            <IconRenderer :icon="item.icon" :size="14" :color="activeSection === item.id ? '#02b8cc' : '#8a8f98'" />
            {{ item.label }}
          </button>
        </nav>

        <div class="mt-auto px-2 py-2 text-[10px] text-[#62666d] font-mono">
          Cansche v{{ appVersion }}
        </div>
      </aside>

      <main class="min-w-0 flex-1 flex flex-col">
        <header class="h-12 shrink-0 px-5 border-b border-[#23252a] flex items-center justify-between">
          <h2 class="text-sm font-semibold text-white">{{ currentSectionLabel }}</h2>
          <button @click="close" class="p-1 text-[#8a8f98] hover:text-white" title="Fechar">
            <IconRenderer icon="lucide:X" :size="16" />
          </button>
        </header>

        <div class="flex-1 overflow-y-auto p-5">
          <section v-if="activeSection === 'general'" class="space-y-4">
            <SettingRow title="Abrir no mês atual" description="Sempre iniciar a aplicação no mês de hoje.">
              <input v-model="draft.general.openToToday" type="checkbox" class="h-4 w-4 accent-[#02b8cc]" />
            </SettingRow>
            <SettingRow title="Confirmar ações destrutivas" description="Pedir confirmação antes de excluir calendários, modelos ou eventos.">
              <input v-model="draft.general.confirmDestructiveActions" type="checkbox" class="h-4 w-4 accent-[#02b8cc]" />
            </SettingRow>
          </section>

          <section v-else-if="activeSection === 'calendar'" class="space-y-4">
            <SettingRow title="Primeiro dia da semana" description="Define como a grade mensal começa.">
              <select v-model.number="draft.calendar.weekStartsOn" class="bg-[#08090a] border border-[#383b3f] rounded-[6px] px-2 py-1.5 text-xs">
                <option :value="1">Segunda-feira</option>
                <option :value="0">Domingo</option>
              </select>
            </SettingRow>
            <SettingRow title="Mostrar finais de semana" description="Exibir sábados e domingos normalmente na grade.">
              <input v-model="draft.calendar.showWeekends" type="checkbox" class="h-4 w-4 accent-[#02b8cc]" />
            </SettingRow>
            <SettingRow title="Mostrar número da semana" description="Exibir a semana ISO no cabeçalho da grade.">
              <input v-model="draft.calendar.showWeekNumbers" type="checkbox" class="h-4 w-4 accent-[#02b8cc]" />
            </SettingRow>
            <SettingRow title="Densidade da grade" description="Escolha entre mais informação ou mais espaço por célula.">
              <select v-model="draft.calendar.density" class="bg-[#08090a] border border-[#383b3f] rounded-[6px] px-2 py-1.5 text-xs">
                <option value="comfortable">Confortável</option>
                <option value="compact">Compacta</option>
              </select>
            </SettingRow>
          </section>

          <section v-else-if="activeSection === 'updates'" class="space-y-4">
            <div class="p-4 rounded-[8px] border border-[#23252a] bg-[#08090a]">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 text-white text-sm font-semibold">
                    <IconRenderer icon="lucide:RefreshCw" :size="16" color="#02b8cc" :class="updateStatus === 'checking' ? 'animate-spin' : ''" />
                    Atualizações do Cansche
                  </div>
                  <p class="text-[11px] text-[#8a8f98] mt-1">Versão instalada: <span class="text-white font-mono">v{{ appVersion }}</span></p>
                </div>
                <span class="text-[10px] px-2 py-1 rounded-full font-mono" :class="statusClass">{{ statusLabel }}</span>
              </div>

              <div v-if="!updaterSupported" class="mt-4 text-xs text-[#8a8f98]">
                O atualizador está disponível somente na versão desktop do Cansche.
              </div>
              <div v-else class="mt-4 flex items-center justify-between gap-3">
                <label class="flex items-center gap-2 text-xs text-[#d0d6e0]">
                  <input v-model="draft.updates.autoCheckEnabled" type="checkbox" class="h-4 w-4 accent-[#02b8cc]" />
                  Verificar atualizações automaticamente
                </label>
                <button @click="emit('check-updates')" :disabled="updateStatus === 'checking' || updateStatus === 'downloading'" class="px-3 py-1.5 rounded-[6px] text-xs bg-[#161718] border border-[#383b3f] text-white hover:bg-[#23252a] disabled:opacity-50">
                  Verificar agora
                </button>
              </div>
            </div>

            <div v-if="updateInfo?.hasUpdate" class="p-4 rounded-[8px] border border-[#02b8cc]/50 bg-[#02b8cc]/5 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-white">Cansche v{{ updateInfo.latestVersion }}</span>
                <span v-if="updateInfo.publishedAt" class="text-[10px] text-[#8a8f98]">{{ formatDate(updateInfo.publishedAt) }}</span>
              </div>
              <div class="text-xs text-[#d0d6e0] whitespace-pre-wrap leading-relaxed">{{ updateInfo.releaseNotes || 'Nova versão disponível.' }}</div>
              <button @click="emit('start-update', progressHandler)" :disabled="updateStatus === 'downloading'" class="px-3 py-1.5 rounded-[6px] text-xs font-medium bg-[#02b8cc] text-[#08090a] hover:bg-[#02b8cc]/80 disabled:opacity-50">
                {{ updateStatus === 'downloading' ? `Baixando ${downloadPercent}%` : 'Baixar e reiniciar' }}
              </button>
            </div>

            <div v-if="updateError" class="p-3 rounded-[6px] border border-[#eb5757]/50 bg-[#eb5757]/10 text-xs text-[#ff9a9a]">
              {{ updateError }}
            </div>
          </section>

          <section v-else-if="activeSection === 'data'" class="space-y-4">
            <div class="p-4 rounded-[8px] border border-[#23252a] bg-[#08090a]">
              <h3 class="text-sm font-semibold text-white">Dados e backups</h3>
              <p class="text-xs text-[#8a8f98] mt-1">Use o gerenciador de workspace para importar, exportar e duplicar calendários.</p>
              <button @click="emit('open-workspace')" class="mt-3 px-3 py-1.5 rounded-[6px] text-xs bg-[#161718] border border-[#383b3f] text-white hover:bg-[#23252a]">Abrir gerenciador de workspace</button>
            </div>
            <div class="p-4 rounded-[8px] border border-[#eb5757]/30 bg-[#eb5757]/5">
              <h3 class="text-sm font-semibold text-white">Restaurar configurações</h3>
              <p class="text-xs text-[#8a8f98] mt-1">Volta as preferências locais para os valores padrão.</p>
              <button @click="resetSettings" class="mt-3 px-3 py-1.5 rounded-[6px] text-xs text-[#ff9a9a] border border-[#eb5757]/50 hover:bg-[#eb5757]/10">Restaurar padrões</button>
            </div>
          </section>

          <section v-else-if="activeSection === 'about'" class="space-y-5">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-[12px] bg-white flex items-center justify-center text-2xl font-bold text-[#08090a]">C</div>
              <div>
                <h3 class="text-lg font-semibold text-white">Cansche</h3>
                <p class="text-xs text-[#8a8f98]">Editor de calendários focado em edição em lote</p>
                <p class="text-xs text-[#02b8cc] font-mono mt-1">v{{ appVersion }}</p>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-white mb-3">Novidades desta versão</h3>
              <div v-if="currentRelease" class="space-y-3">
                <div v-for="section in currentRelease.sections" :key="section.title">
                  <h4 class="text-xs font-medium text-[#02b8cc]">{{ section.title }}</h4>
                  <ul class="mt-1 space-y-1 text-xs text-[#d0d6e0] list-disc pl-5">
                    <li v-for="item in section.items" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>
              <p v-else class="text-xs text-[#8a8f98]">As notas desta versão ainda não foram publicadas.</p>
            </div>
          </section>
        </div>

        <footer class="h-14 shrink-0 px-5 border-t border-[#23252a] flex items-center justify-between">
          <span class="text-[10px] text-[#62666d]">As configurações são salvas automaticamente.</span>
          <button @click="close" class="px-3 py-1.5 rounded-[6px] text-xs bg-[#161718] border border-[#383b3f] text-white hover:bg-[#23252a]">Concluir</button>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { UpdateInfo, UpdateStatus } from '@cansche/platform';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../services/AppSettingsService';
import { ChangelogRelease } from '../services/ChangelogService';
import IconRenderer from './IconRenderer.vue';

const props = defineProps<{
  isOpen: boolean;
  settings: AppSettings;
  appVersion: string;
  updaterSupported: boolean;
  updateStatus: UpdateStatus;
  updateInfo: UpdateInfo | null;
  updateError: string | null;
  currentRelease: ChangelogRelease | null;
  initialSection: SectionId;
}>();

const emit = defineEmits<{
  close: [];
  'save-settings': [settings: AppSettings];
  'check-updates': [];
  'start-update': [onProgress: (downloaded: number, total: number) => void];
  'open-workspace': [];
}>();

type SectionId = 'general' | 'calendar' | 'updates' | 'data' | 'about';

const sections: Array<{ id: SectionId; label: string; icon: string }> = [
  { id: 'general', label: 'Geral', icon: 'lucide:SlidersHorizontal' },
  { id: 'calendar', label: 'Calendário', icon: 'lucide:CalendarDays' },
  { id: 'updates', label: 'Atualizações', icon: 'lucide:RefreshCw' },
  { id: 'data', label: 'Dados', icon: 'lucide:Database' },
  { id: 'about', label: 'Sobre', icon: 'lucide:Info' },
];

const activeSection = ref<SectionId>('general');
const draft = ref<AppSettings>(clone(props.settings));
const downloadPercent = ref(0);

const currentSectionLabel = computed(() => sections.find((section) => section.id === activeSection.value)?.label || 'Configurações');
const currentRelease = computed(() => props.currentRelease);

const statusLabel = computed(() => {
  switch (props.updateStatus) {
    case 'checking': return 'Verificando';
    case 'available': return 'Disponível';
    case 'downloading': return 'Baixando';
    case 'up-to-date': return 'Atualizado';
    case 'unsupported': return 'Desktop';
    case 'error': return 'Erro';
    default: return 'Pronto';
  }
});

const statusClass = computed(() => {
  if (props.updateStatus === 'available') return 'bg-[#02b8cc]/15 text-[#02b8cc]';
  if (props.updateStatus === 'error') return 'bg-[#eb5757]/15 text-[#ff9a9a]';
  return 'bg-[#161718] text-[#8a8f98]';
});

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    draft.value = clone(props.settings);
    activeSection.value = props.initialSection;
    downloadPercent.value = 0;
  }
});

watch(draft, (value) => {
  if (props.isOpen) emit('save-settings', clone(value));
}, { deep: true });

function clone(settings: AppSettings): AppSettings {
  return JSON.parse(JSON.stringify(settings)) as AppSettings;
}

function close() {
  emit('close');
}

function resetSettings() {
  draft.value = clone(DEFAULT_APP_SETTINGS);
}

function progressHandler(downloaded: number, total: number) {
  downloadPercent.value = total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : 0;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
}
</script>

<script lang="ts">
export default {
  components: {
    SettingRow: {
      props: {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
      template: '<div class="flex items-center justify-between gap-6 p-4 rounded-[8px] border border-[#23252a] bg-[#08090a]"><div><div class="text-xs font-medium text-white">{{ title }}</div><div class="text-[11px] text-[#8a8f98] mt-1">{{ description }}</div></div><div class="shrink-0"><slot /></div></div>',
    },
  },
};
</script>
