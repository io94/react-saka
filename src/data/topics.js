import { allTrees as trees } from './trees.js'

export const topics = [
  {
    id: 'sacred-space',
    slug: 'sacred-space',
    title: 'Sacred Space in Bali',
    color: '#c9842c',
    colorLight: '#f3e8d4',
    tags: ['Buddhism', 'dance', 'Hinduism', 'Islam', 'ritual', 'sacredness', 'shrine', 'community', 'rejuvination', 'river'],
    bannerImage: '/images/topics/sacred-space.jpg',
  },
  {
    id: 'ritual-ecology',
    slug: 'ritual-ecology',
    title: 'Ritual Experience & Ecology',
    color: '#2d5a27',
    colorLight: '#d4ecd4',
    tags: ['community', 'ecology', 'rejuvination', 'ritual', 'river', 'shrine', 'dance'],
    bannerImage: '/images/topics/ritual-ecology.jpg',
  },
  {
    id: 'green-infrastructure',
    slug: 'green-infrastructure',
    title: 'Green Infrastructure',
    color: '#3d7a78',
    colorLight: '#d4ece8',
    tags: ['ecology', 'greenness', 'rejuvination', 'community'],
    bannerImage: '/images/topics/green-infrastructure.jpg',
  },
]

export function getTopicBySlug(slug) {
  return topics.find((t) => t.slug === slug) ?? null
}

export function getTreesForTopic(topic) {
  return trees.filter((tree) =>
    tree.subjects.some((s) => topic.tags.includes(s))
  )
}
