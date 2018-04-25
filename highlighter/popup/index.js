Vue.component('clickable-content', {
  props: ['v'],
  data() {
    return {
      editing: false,
    }
  },
  render(createElement) {
    /*
      <input v-if="this.editing"
        type="text" value="this.v"
        @click="finishEdit($event)"
        @blur="finishEdit($event)"
        @keyup.enter="finishEdit($event)"
        />
      <span v-else @click="beginEdit($event)">this.v</span>
    */
    const vm = this
    if (this.editing) {
      return createElement('input', {
        on: {
          click(ev) {
            vm.finishEdit(ev)
          },
          blur(ev) {
            vm.finishEdit(ev)
          },
          keyup(ev) {
            if (ev.keyCode != 13) {
              return
            };
            vm.finishEdit(ev)
          }
        },
        domProps: {type: 'text', value: this.v}
      })
    } else {
      return createElement('span', {
        on: {
          click(ev) {
            vm.beginEdit(ev)
          }
        },
        domProps: {textContent: `${this.v}`}
      })
    }
  },
  methods: {
    finishEdit(ev) {
      const value = ev.target.value
      this.value = value
      this.$emit('up', value)
      this.editing = false
    },
    beginEdit(ev) {
      this.editing = true;
      this.$nextTick(() => {
        this.$el.focus()
      })
    }
  }
})

new Vue({
  el: '#app',
  render(createElement) {
    /*
     <div class="wrapper">
       <span class="add" @click="addItem()" :class="this._canAddOrigin ? 'active' : 'inactive' "></span>
       <div class="row" v-key="item.id" v-for="item in items">
           <clickable-content type="text" class="origin" :v="item.origin"></clickable-content>
           <span class="color" @click="item.color++; vm.updateItem(item.id, 'color', item.color)"></span>
           <span class="height" @click="item.height++; vm.updateItem(item.id, 'height', item.height)"></span>
           <a href="#" class="del" @click.prevent="deleteItem(item.id)"></a>
       </div>
     </div>
    */
    let el = createElement
    let vm = this
    return el('div', {attrs: {class: 'wrapper'}}, [
      el('span', {attrs: {class: `add ${this._canAddOrigin ? 'active' : 'inactive'}`},
                  on: {click(ev) {vm.addItem()}}})
    ].concat(this.items.map(item => {
      return el('div', {key: item.id,
                        attrs: {class: `row ${this.matchItem(item) ? 'active' : ''}`}}, [
                          el('clickable-content', {attrs: {class: 'origin'},
                                                   props: {v: item.origin, type: 'text'},
                                                   on: {up(v){vm.updateItem(item.id, 'origin', v)}}}),
                          el('span', {attrs: {class: 'color'},
                                      style: {backgroundColor: `${getColor(item)}`},
                                      on: {click(ev){item.color++;
                                                     vm.updateItem(item.id, 'color', item.color)}}}),
                          el('span', {attrs: {class: 'height'},
                                      domProps: {textContent: `${getHeight(item)}`},
                                      on: {click(ev){item.height++;
                                                     vm.updateItem(item.id, 'height', item.height)}}}),
                          el('a', {attrs: {class: 'del'},
                                   on: {click(ev) {ev.preventDefault(); vm.deleteItem(item.id) }},
                                   domProps: {href: '#'}
                          })
                       ]
               )
      }))
    )
  },
  data: {
    items: [
      // {id, origin, color, border}
    ],
    _canAddOrigin: null,
    _currentURL: null,
    _currentTab: null,
  },
  async created() {
    const tabs = await browser.tabs.query({
      currentWindow: true,
      active: true,
    })
    this._currentTab = tabs[0]
    this._currentURL = new URL(tabs[0].url)

    const settings = await loadFromStorage()
    if (!settings['highlighter']) {
      this.items = []
    } else {
      this.items = settings['highlighter']
    }
  },
  watch: {
    async items(newItems, oldItems) {
      this.items = newItems
      if (this.canAddOrigin(this._currentURL.origin)) {
        this._canAddOrigin = true
      } else {
        this._canAddOrigin = false
      }
      await saveToStorage(this.items)

      await browser.tabs.sendMessage(this._currentTab.id, {
        command: 'itemUpdated'
      })
    }
  },
  methods: {
    canAddOrigin(target) {
      if (!target || target === 'null'){
        return false
      }

      if (
        this.items.find(item => {
          if (new RegExp(item.origin).test(target)) {
            return true
          }
        })
      ) {
        return false
      }

      return true
    },
    matchItem(item) {
      const target = this._currentURL.origin
      if (new RegExp(item.origin).test(target)) {
        return true
      }
    },

    addItem() {
      if (! this.canAddOrigin(this._currentURL.origin)) {
        return false
      }

      this.items.push({
        id: `${Math.random()}`,
        origin: this._currentURL.origin,
        color: 1,
        height: 1,
      })
    },
    updateItem(id, k, v) {
      let newItems = []
      this.items.forEach(item => {
        if (id === item.id) {
          item[k] = v
          newItems.push(item)
        } else {
          newItems.push(item)
        }
      })
      this.items = newItems
    },
    deleteItem(targetId) {
      let newItems = []
      this.items.forEach(item => {
        if (targetId != item.id) {
          newItems.push(item)
        }
      })
      this.items = newItems
    },

  }
})
