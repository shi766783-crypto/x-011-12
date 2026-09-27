import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CardInput, CardMastery, KnowledgeCard } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { read, write } from '@/services/storage'
import { uid } from '@/utils/id'
import { today } from '@/utils/date'

export const useCardsStore = defineStore('cards', () => {
  const cards = ref<KnowledgeCard[]>(read<KnowledgeCard[]>(STORAGE_KEYS.cards, []))

  function persist(): void {
    write(STORAGE_KEYS.cards, cards.value)
  }

  function addCard(input: CardInput): KnowledgeCard {
    const card: KnowledgeCard = {
      ...input,
      id: uid(),
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    }
    cards.value.unshift(card)
    persist()
    return card
  }

  function updateCard(id: string, patch: Partial<KnowledgeCard>): void {
    const target = cards.value.find((c) => c.id === id)
    if (target) {
      Object.assign(target, patch)
      persist()
    }
  }

  function removeCard(id: string): void {
    cards.value = cards.value.filter((c) => c.id !== id)
    persist()
  }

  /** 复习后更新掌握程度与复习计数 */
  function markReviewed(id: string, mastery: CardMastery): void {
    const target = cards.value.find((c) => c.id === id)
    if (target) {
      target.mastery = mastery
      target.reviewCount += 1
      target.lastReviewedAt = today()
      persist()
    }
  }

  return { cards, addCard, updateCard, removeCard, markReviewed }
})
