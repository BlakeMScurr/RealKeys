import Dropdown from './Dropdown.svelte';
export default {
  title: 'Dropdown',
};

let list = new Map()
list.set('Option A', "asdfasdf")
list.set('Option B', "beehibe")
list.set('Option C', "coomer")
export const Default = () => ({
  Component: Dropdown,
  props: {
    list: list,
  }
});