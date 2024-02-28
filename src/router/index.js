import {createRouter, createWebHistory} from 'vue-router'
import home from '@/views/home.vue'

const routes = [
    {path: '/', name: 'home', component: home},
    {path: '/search', name: 'search', component: ()=>import('@/views/search.vue')},
    {path: '/search-results', name: 'searchResults', component: ()=>import('@/views/searchResults.vue')},
    {path: '/:pathMatch(.*)*', name: 'notFound', component: ()=>import('@/views/notFound.vue')}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router