<template>
  <div class="relative w-full h-full min-h-[600px] bg-amber-50 bg-kawung rounded-xl overflow-hidden border border-amber-200/60">
    <!-- Empty state -->
    <div v-if="persons.length === 0" class="flex items-center justify-center h-full min-h-[600px]">
      <div class="text-center">
        <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-amber-600" />
        </div>
        <p class="font-javanese text-stone-600">Belum ada anggota untuk divisualisasikan</p>
      </div>
    </div>

    <!-- SVG tree -->
    <svg v-else ref="svgRef" class="w-full h-full" style="min-height: 600px" />

    <!-- Zoom controls -->
    <div v-if="persons.length > 0" class="absolute bottom-4 right-4 flex flex-col gap-2">
      <UButton
        icon="i-heroicons-plus"
        size="xs"
        color="neutral"
        variant="outline"
        title="Perbesar"
        @click="zoomIn"
      />
      <UButton
        icon="i-heroicons-minus"
        size="xs"
        color="neutral"
        variant="outline"
        title="Perkecil"
        @click="zoomOut"
      />
      <UButton
        icon="i-heroicons-arrows-pointing-in"
        size="xs"
        color="neutral"
        variant="outline"
        title="Reset"
        @click="resetZoom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import type { Person } from '../../../domain/entities/person'
import { getFullName } from '../../../domain/entities/person'
import type { Relationship } from '../../../domain/entities/relationship'
import { buildTree } from '../../composables/useTreeData'
import type { FamilyTreeNode } from '../../composables/useTreeData'

const props = defineProps<{
  rootPersonId: string | null
  persons: Person[]
  relationships: Relationship[]
  treeId: string
}>()

const emit = defineEmits<{
  nodeClick: [personId: string]
}>()

const svgRef = ref<SVGSVGElement | null>(null)
const gRef = ref<SVGGElement | null>(null)

// Card dimensions
const CARD_W = 170
const CARD_H = 80
const COUPLE_GAP = 24 // gap between spouse cards
const COUPLE_W = CARD_W * 2 + COUPLE_GAP // total width for a couple
const NODE_SPACING_X = COUPLE_W + 40 // horizontal spacing between layout nodes
const NODE_SPACING_Y = 140 // vertical spacing between generations

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let zoomBehavior: any = null
let clipCounter = 0

function getInitials(person: Person): string {
  const first = person.firstName.charAt(0).toUpperCase()
  const last = person.lastName ? person.lastName.charAt(0).toUpperCase() : ''
  return first + last
}

function getBirthDeathLabel(person: Person): string {
  const birth = person.birthDate ? new Date(person.birthDate).getFullYear().toString() : null
  const death = person.deathDate
    ? new Date(person.deathDate).getFullYear().toString()
    : (!person.isAlive ? '†' : null)
  if (birth && death) return `${birth} – ${death}`
  if (birth) return birth
  if (death) return death
  return ''
}

/**
 * Draw a single person card at given (cx, cy) center position.
 * Returns the group element.
 */
function drawPersonCard(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  person: Person,
  cx: number,
  cy: number,
  isRootPerson: boolean,
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
) {
  const cardG = parent.append('g')
    .attr('class', 'person-card')
    .attr('transform', `translate(${cx},${cy})`)
    .attr('cursor', 'pointer')
    .on('click', () => emit('nodeClick', person.id))

  // Card background
  cardG.append('rect')
    .attr('x', -CARD_W / 2)
    .attr('y', -CARD_H / 2)
    .attr('width', CARD_W)
    .attr('height', CARD_H)
    .attr('rx', 10)
    .attr('fill', 'white')
    .attr('stroke', isRootPerson ? '#d97706' : '#e5c57a')
    .attr('stroke-width', isRootPerson ? 3 : 1.5)
    .attr('filter', `url(#node-shadow-${props.treeId})`)

  // Gold top bar
  cardG.append('rect')
    .attr('x', -CARD_W / 2)
    .attr('y', -CARD_H / 2)
    .attr('width', CARD_W)
    .attr('height', 4)
    .attr('rx', 10)
    .attr('fill', `url(#trah-gold-${props.treeId})`)

  // Avatar
  const avatarCx = -CARD_W / 2 + 30
  const avatarR = 20

  cardG.append('circle')
    .attr('cx', avatarCx)
    .attr('cy', 0)
    .attr('r', avatarR)
    .attr('fill', person.gender === 'F' ? '#fce7f3' : '#dbeafe')
    .attr('stroke', '#d97706')
    .attr('stroke-width', 1.5)

  if (person.photoUrl) {
    const clipId = `photo-clip-${props.treeId}-${clipCounter++}`
    defs.append('clipPath')
      .attr('id', clipId)
      .append('circle')
      .attr('cx', cx + avatarCx)
      .attr('cy', cy)
      .attr('r', avatarR - 1)

    cardG.append('image')
      .attr('href', person.photoUrl)
      .attr('x', avatarCx - avatarR + 1)
      .attr('y', -(avatarR - 1))
      .attr('width', (avatarR - 1) * 2)
      .attr('height', (avatarR - 1) * 2)
      .attr('clip-path', `url(#${clipId})`)
      .attr('preserveAspectRatio', 'xMidYMid slice')
  }
  else {
    cardG.append('text')
      .attr('x', avatarCx)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12')
      .attr('font-weight', '600')
      .attr('fill', '#78350f')
      .text(getInitials(person))
  }

  // Name
  const textX = -CARD_W / 2 + 58
  const fullName = getFullName(person)
  const maxChars = 14
  const displayName = fullName.length > maxChars ? fullName.slice(0, maxChars - 1) + '…' : fullName

  cardG.append('text')
    .attr('x', textX)
    .attr('y', -8)
    .attr('font-size', '12')
    .attr('font-family', 'Playfair Display, serif')
    .attr('font-weight', '600')
    .attr('fill', isRootPerson ? '#92400e' : '#1c1917')
    .attr('text-anchor', 'start')
    .text(displayName)

  // Birth-death label
  cardG.append('text')
    .attr('x', textX)
    .attr('y', 10)
    .attr('font-size', '10')
    .attr('fill', '#78716c')
    .attr('text-anchor', 'start')
    .text(getBirthDeathLabel(person))

  // Linked person indicator
  if (person.linkedPersonId) {
    cardG.append('text')
      .attr('x', CARD_W / 2 - 14)
      .attr('y', -CARD_H / 2 + 14)
      .attr('font-size', '10')
      .attr('fill', '#d97706')
      .text('🔗')
  }

  // Hover
  cardG
    .on('mouseenter', function () {
      d3.select(this).select('rect:first-of-type')
        .attr('stroke', '#d97706')
        .attr('stroke-width', isRootPerson ? 4 : 2.5)
    })
    .on('mouseleave', function () {
      d3.select(this).select('rect:first-of-type')
        .attr('stroke', isRootPerson ? '#d97706' : '#e5c57a')
        .attr('stroke-width', isRootPerson ? 3 : 1.5)
    })

  return cardG
}

function renderTree() {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  clipCounter = 0

  if (props.persons.length === 0) return

  // Auto-pick root
  const childIds = new Set(
    props.relationships
      .filter(r => r.relationshipType === 'parent')
      .map(r => r.relatedPersonId),
  )
  const effectiveRoot = props.rootPersonId
    ?? props.persons.find(p => !childIds.has(p.id))?.id
    ?? props.persons[0]?.id

  if (!effectiveRoot) return

  const treeData = buildTree(effectiveRoot, props.persons, props.relationships)
  if (!treeData) return

  // Defs
  const defs = svg.append('defs')
  const grad = defs
    .append('linearGradient')
    .attr('id', `trah-gold-${props.treeId}`)
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '0%')
  grad.append('stop').attr('offset', '0%').attr('style', 'stop-color:#d97706;stop-opacity:1')
  grad.append('stop').attr('offset', '100%').attr('style', 'stop-color:#fbbf24;stop-opacity:1')

  const filter = defs.append('filter').attr('id', `node-shadow-${props.treeId}`)
  filter.append('feDropShadow')
    .attr('dx', 0).attr('dy', 2)
    .attr('stdDeviation', 3)
    .attr('flood-color', '#00000018')

  // Main group
  const g = svg.append('g')
  gRef.value = g.node() as SVGGElement

  // D3 hierarchy layout
  const root = d3.hierarchy<FamilyTreeNode>(treeData, d => d.children.length > 0 ? d.children : null)

  const treeLayout = d3.tree<FamilyTreeNode>()
    .nodeSize([NODE_SPACING_X, NODE_SPACING_Y])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.2))

  treeLayout(root)

  const descendants = root.descendants()
  const links = root.links()

  // Draw links (parent → child)
  const linkGroup = g.append('g').attr('class', 'links')
  for (const link of links) {
    const sx = link.source.x
    const sy = link.source.y + CARD_H / 2 // bottom of parent card area
    const tx = link.target.x
    // If target has a spouse, the main person card is offset left
    const targetHasSpouse = link.target.data.spouse !== null
    const targetCx = targetHasSpouse ? tx - (CARD_W / 2 + COUPLE_GAP / 2) : tx
    const ty = link.target.y - CARD_H / 2 // top of child card

    const midY = (sy + ty) / 2

    linkGroup.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#d97706')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.6)
      .attr('d', `M${sx},${sy} L${sx},${midY} L${targetCx},${midY} L${targetCx},${ty}`)
  }

  // Draw nodes (person cards + spouse cards)
  const nodeGroup = g.append('g').attr('class', 'nodes')

  for (const d of descendants) {
    const hasSpouse = d.data.spouse !== null
    const isRootNode = d.data.id === effectiveRoot

    if (hasSpouse && d.data.spouse) {
      // Two cards side by side
      const personCx = d.x - (CARD_W / 2 + COUPLE_GAP / 2)
      const spouseCx = d.x + (CARD_W / 2 + COUPLE_GAP / 2)

      drawPersonCard(nodeGroup as unknown as d3.Selection<SVGGElement, unknown, null, undefined>, d.data.person, personCx, d.y, isRootNode, defs)
      drawPersonCard(nodeGroup as unknown as d3.Selection<SVGGElement, unknown, null, undefined>, d.data.spouse, spouseCx, d.y, false, defs)

      // Connector line between spouse cards with heart
      const lineY = d.y
      const lineX1 = personCx + CARD_W / 2
      const lineX2 = spouseCx - CARD_W / 2

      nodeGroup.append('line')
        .attr('x1', lineX1).attr('y1', lineY)
        .attr('x2', lineX2).attr('y2', lineY)
        .attr('stroke', '#d97706')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8)

      // Heart symbol in the middle
      const heartX = (lineX1 + lineX2) / 2
      nodeGroup.append('text')
        .attr('x', heartX)
        .attr('y', lineY)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12')
        .attr('fill', '#d97706')
        .text('♥')
    }
    else {
      // Single person card centered
      drawPersonCard(nodeGroup as unknown as d3.Selection<SVGGElement, unknown, null, undefined>, d.data.person, d.x, d.y, isRootNode, defs)
    }
  }

  // Setup zoom
  zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoomBehavior)

  nextTick(() => {
    centerTree()
  })
}

function centerTree() {
  if (!svgRef.value || !gRef.value || !zoomBehavior) return
  const svg = svgRef.value
  const width = svg.clientWidth || 800
  const height = svg.clientHeight || 600
  const bbox = gRef.value.getBBox()
  if (bbox.width === 0 && bbox.height === 0) return
  const scale = Math.min(0.9, Math.min(width / (bbox.width + 80), height / (bbox.height + 80)))
  const tx = width / 2 - (bbox.x + bbox.width / 2) * scale
  const ty = 60
  d3.select(svgRef.value).call(
    zoomBehavior.transform,
    d3.zoomIdentity.translate(tx, ty).scale(scale),
  )
}

function zoomIn() {
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value).transition().duration(300).call(zoomBehavior.scaleBy, 1.3)
}

function zoomOut() {
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value).transition().duration(300).call(zoomBehavior.scaleBy, 0.7)
}

function resetZoom() {
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value).transition().duration(400).call(zoomBehavior.transform, d3.zoomIdentity)
  nextTick(() => centerTree())
}

onMounted(() => {
  renderTree()
})

watch(
  () => [props.rootPersonId, props.persons, props.relationships] as const,
  () => {
    nextTick(() => renderTree())
  },
  { deep: true },
)
</script>
