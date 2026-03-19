<template>
  <UInput
    :model-value="displayValue"
    placeholder="dd/mm/yyyy"
    maxlength="10"
    class="w-full"
    @input="onInput"
    @blur="onBlur"
  />
</template>

<script setup lang="ts">
import { isoToDMY, dmyToISO } from '../../utils/date'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const displayValue = ref(isoToDMY(props.modelValue))

watch(() => props.modelValue, (newVal) => {
  const converted = isoToDMY(newVal)
  if (converted && converted !== displayValue.value) {
    displayValue.value = converted
  }
  if (!newVal) {
    displayValue.value = ''
  }
})

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  let val = input.value.replace(/[^\d/]/g, '')

  // Auto-insert slashes
  const digits = val.replace(/\//g, '')
  if (digits.length >= 4 && !val.includes('/')) {
    val = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8)
  } else if (digits.length >= 2 && val.split('/').length < 2) {
    val = digits.slice(0, 2) + '/' + digits.slice(2)
  }

  // Enforce max length
  if (val.length > 10) val = val.slice(0, 10)

  displayValue.value = val
  input.value = val

  // Emit ISO if complete and valid
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const iso = dmyToISO(val)
    if (iso) emit('update:modelValue', iso)
  }
}

function onBlur() {
  const val = displayValue.value
  if (!val) {
    emit('update:modelValue', '')
    return
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const iso = dmyToISO(val)
    if (iso) emit('update:modelValue', iso)
  }
}
</script>
