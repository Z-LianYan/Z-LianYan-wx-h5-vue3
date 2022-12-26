import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { useCounterStore } from './counter';

const useIndexStore = defineStore('index', () => {
  let userInfo =  ref<any>(null)
  const counterStore = useCounterStore();
  const count = computed(()=>counterStore.count);

  return { 
    count,
    userInfo
   }
})

export {
  useIndexStore,
  useCounterStore
}