<template>
  <div class="relative w-full h-full min-h-[600px] bg-amber-50 bg-kawung rounded-xl overflow-hidden border border-amber-200/60">
    <!-- Empty state -->
    <div v-if="!rootPersonId || persons.length === 0" class="flex items-center justify-center h-full min-h-[600px]">
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
    <div v-if="rootPersonId && persons.length > 0" class="absolute bottom-4 right-4 flex flex-col gap-2">
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

// Node dimensions
const NODE_WIDTH = 200
const NODE_HEIGHT = 90
const NODE_SPACING_X = 240
const NODE_SPACING_Y = 160

// Zoom behavior — typed loosely to avoid d3 type complexity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let zoomBehavior: any = null

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

function renderTree() {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  if (!props.rootPersonId || props.persons.length === 0) return

  const treeData = buildTree(props.rootPersonId, props.persons, props.relationships)
  if (!treeData) return

  // Define gradient
  const defs = svg.append('defs')
  const grad = defs
    .append('linearGradient')
    .attr('id', `trah-gold-${props.treeId}`)
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '0%')
  grad.append('stop').attr('offset', '0%').attr('style', 'stop-color:#d97706;stop-opacity:1')
  grad.append('stop').attr('offset', '100%').attr('style', 'stop-color:#fbbf24;stop-opacity:1')

  // Clip path for avatar circle
  defs.append('clipPath')
    .attr('id', `avatar-clip-${props.treeId}`)
    .append('circle')
    .attr('cx', 0).attr('cy', 0).attr('r', 22)

  // Main group (pan/zoom target)
  const g = svg.append('g')
  gRef.value = g.node() as SVGGElement

  // Build d3 hierarchy
  const root = d3.hierarchy<FamilyTreeNode>(treeData, d => d.children.length > 0 ? d.children : null)

  const treeLayout = d3.tree<FamilyTreeNode>()
    .nodeSize([NODE_SPACING_X, NODE_SPACING_Y])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.2))

  treeLayout(root)

  // Draw links
  const linkGroup = g.append('g').attr('class', 'links')
  linkGroup.selectAll('path')
    .data(root.links())
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', '#d97706')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.6)
    .attr('d', d3.linkVertical<d3.HierarchyPointLink<FamilyTreeNode>, d3.HierarchyPointNode<FamilyTreeNode>>()
      .x(d => d.x)
      .y(d => d.y),
    )

  // Draw nodes
  const nodeGroup = g.append('g').attr('class', 'nodes')
  const nodes = nodeGroup.selectAll('g.node')
    .data(root.descendants())
    .join('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x},${d.y})`)
    .attr('cursor', 'pointer')
    .on('click', (_event, d) => {
      emit('nodeClick', d.data.person.id)
    })

  const isRoot = (d: d3.HierarchyPointNode<FamilyTreeNode>) => d.data.id === props.rootPersonId

  // Shadow filter
  const filter = defs.append('filter').attr('id', `node-shadow-${props.treeId}`)
  filter.append('feDropShadow')
    .attr('dx', 0).attr('dy', 2)
    .attr('stdDeviation', 3)
    .attr('flood-color', '#00000018')

  // Node background
  nodes.append('rect')
    .attr('x', -NODE_WIDTH / 2)
    .attr('y', -NODE_HEIGHT / 2)
    .attr('width', NODE_WIDTH)
    .attr('height', NODE_HEIGHT)
    .attr('rx', 10)
    .attr('fill', 'white')
    .attr('stroke', d => isRoot(d) ? '#d97706' : '#e5c57a')
    .attr('stroke-width', d => isRoot(d) ? 3 : 1.5)
    .attr('filter', `url(#node-shadow-${props.treeId})`)

  // Gold top bar
  nodes.append('rect')
    .attr('x', -NODE_WIDTH / 2)
    .attr('y', -NODE_HEIGHT / 2)
    .attr('width', NODE_WIDTH)
    .attr('height', 4)
    .attr('rx', 10)
    .attr('fill', `url(#trah-gold-${props.treeId})`)

  // Avatar circle background
  nodes.append('circle')
    .attr('cx', -NODE_WIDTH / 2 + 32)
    .attr('cy', 0)
    .attr('r', 22)
    .attr('fill', d => d.data.person.gender === 'F' ? '#fce7f3' : '#dbeafe')
    .attr('stroke', '#d97706')
    .attr('stroke-width', 1.5)

  // Avatar initials
  nodes.filter(d => !d.data.person.photoUrl)
    .append('text')
    .attr('x', -NODE_WIDTH / 2 + 32)
    .attr('y', 0)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('font-size', '13')
    .attr('font-weight', '600')
    .attr('fill', '#78350f')
    .text(d => getInitials(d.data.person))

  // Avatar photo (foreignObject for img)
  const withPhoto = nodes.filter(d => !!d.data.person.photoUrl)
  withPhoto.append('defs')
    .append('clipPath')
    .attr('id', (d, i) => `photo-clip-${props.treeId}-${i}`)
    .append('circle')
    .attr('cx', -NODE_WIDTH / 2 + 32)
    .attr('cy', 0)
    .attr('r', 21)

  withPhoto.append('image')
    .attr('href', d => d.data.person.photoUrl ?? '')
    .attr('x', -NODE_WIDTH / 2 + 11)
    .attr('y', -21)
    .attr('width', 42)
    .attr('height', 42)
    .attr('clip-path', (_d, i) => `url(#photo-clip-${props.treeId}-${i})`)
    .attr('preserveAspectRatio', 'xMidYMid slice')

  // Full name text
  const textX = -NODE_WIDTH / 2 + 64

  nodes.append('text')
    .attr('x', textX)
    .attr('y', -12)
    .attr('font-size', '13')
    .attr('font-family', 'Playfair Display, serif')
    .attr('font-weight', '600')
    .attr('fill', '#1c1917')
    .attr('text-anchor', 'start')
    .each(function (d) {
      const fullName = getFullName(d.data.person)
      const el = d3.select(this)
      // Truncate if too long
      const maxWidth = NODE_WIDTH / 2 + 32
      if (fullName.length > 18) {
        el.text(fullName.slice(0, 16) + '…')
      }
      else {
        el.text(fullName)
      }
      // Root crown indicator
      if (isRoot(d)) {
        el.attr('fill', '#92400e')
      }
    })

  // Birth-death years
  nodes.append('text')
    .attr('x', textX)
    .attr('y', 6)
    .attr('font-size', '11')
    .attr('fill', '#78716c')
    .attr('text-anchor', 'start')
    .text(d => getBirthDeathLabel(d.data.person))

  // Spouse chip (if spouse exists)
  nodes.filter(d => d.data.spouse !== null)
    .each(function (d) {
      const spouseName = d.data.spouse ? getFullName(d.data.spouse) : ''
      const shortName = spouseName.length > 14 ? spouseName.slice(0, 12) + '…' : spouseName
      const chipWidth = Math.min(shortName.length * 7 + 20, 130)
      const chipX = textX
      const chipY = 20

      const g = d3.select(this)
      g.append('rect')
        .attr('x', chipX)
        .attr('y', chipY)
        .attr('width', chipWidth)
        .attr('height', 18)
        .attr('rx', 9)
        .attr('fill', '#fef3c7')
        .attr('stroke', '#d97706')
        .attr('stroke-width', 0.8)

      g.append('text')
        .attr('x', chipX + chipWidth / 2)
        .attr('y', chipY + 9)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '9.5')
        .attr('fill', '#92400e')
        .text('♥ ' + shortName)
    })

  // Hover effect
  nodes
    .on('mouseenter', function (_event, d) {
      d3.select(this).select('rect:first-of-type')
        .attr('stroke', '#d97706')
        .attr('stroke-width', d.data.id === props.rootPersonId ? 4 : 2.5)
    })
    .on('mouseleave', function (_event, d) {
      d3.select(this).select('rect:first-of-type')
        .attr('stroke', isRoot(d) ? '#d97706' : '#e5c57a')
        .attr('stroke-width', isRoot(d) ? 3 : 1.5)
    })

  // Setup zoom
  zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoomBehavior)

  // Center tree after a tick
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
    renderTree()
  },
  { deep: true },
)
</script>
