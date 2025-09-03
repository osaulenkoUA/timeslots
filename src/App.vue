<script setup>
import {computed, reactive, ref} from 'vue';
import dataWeek from '@/data.json';
import {mergeIntervals} from '@/mergeIntervals.js';
import {exportToJson} from '@/exportToJson.js';

const days = ["mo", "tu", "we", "th", "fr", "sa", "su"];
const hours = Array.from({ length: 24 / 3 }, (_, i) => i * 180);
const minutes = Array.from({ length: 24 }, (_, i) => i * 60);

const schedule = reactive(dataWeek);

const isDragging = ref(false);
const dragDay = ref(null);

function minutesToLabel(mins) {
  const h = Math.floor(mins / 60);
  return `${String(h).padStart(2, "0")}:00`;
}

function toggleSlot(day, start) {
  const end = start + 59;

  const exists = schedule[day].find(i => i.bt === start && i.et === end);
  if (exists) {
    schedule[day] = schedule[day].filter(i => !(i.bt === start && i.et === end));
    return (schedule[day] = mergeIntervals(schedule[day]));
  }
  const index = schedule[day].findIndex(i => start >= i.bt && end <= i.et);
  if (index !== -1) {
    const range = schedule[day][index];
    const newRanges = [];
    if (range.bt < start) {
      newRanges.push({ bt: range.bt, et: start - 1 });
    }
    if (range.et > end) {
      newRanges.push({ bt: end + 1, et: range.et });
    }
    schedule[day].splice(index, 1, ...newRanges);
  } else {
    schedule[day].push({ bt: start, et: end });
  }
  schedule[day] = mergeIntervals(schedule[day]);
}


function handleMouseDown(day, start) {
  isDragging.value = true;
  dragDay.value = day;
  toggleSlot(day, start);
}

function handleMouseEnter(day, start) {
  if (isDragging.value && dragDay.value === day) {
    toggleSlot(day, start);
  }
}

function handleMouseUp() {
  isDragging.value = false;
  dragDay.value = null;
}

function toggleAllDay(day) {
  if (schedule[day].length === 1 && schedule[day][0].bt === 0 && schedule[day][0].et === 1439) {
    schedule[day] = [];
  } else {
    schedule[day] = [{ bt: 0, et: 1439 }];
  }
}

function onHandleExportToJson() {
  console.log(JSON.stringify(schedule, null, 2));
  exportToJson(schedule)
}

const onHandleClear=()=> days.forEach(el=>{schedule[el]=[]})

const isAllDay = computed(() => (day) => {
  return (
    schedule[day].length === 1 &&
    schedule[day][0].bt === 0 &&
    schedule[day][0].et === 1439
  );
});

const isSomeDay = computed(() => (day) => {
  return schedule[day].length > 0;
});

</script>

<template>
  <div class="container" @mouseup="handleMouseUp">
    <table border="1" cellspacing="0" cellpadding="4">
      <thead>
      <tr>
        <th></th>
        <th>All<br></br> day</th>
        <th
          v-for="start in hours"
          :key="start"
          colspan="3"
        >
          {{ minutesToLabel(start) }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="day in days" :key="day">
        <td :style="{ backgroundColor: isSomeDay(day) ? '#dcdada' : '' }">{{ day.toUpperCase() }}</td>
        <td  class="cellBtnAll" @click="toggleAllDay(day)">
          <svg v-if="isAllDay(day)" fill="#ffffff" width="16px" height="16px" viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12zm16.28-2.72a.75.75 0 00-1.06-1.06l-5.97 5.97-2.47-2.47a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l6.5-6.5z"/>
          </svg>
        </td>
        <td
          v-for="start in minutes"
          :key="start"
          :style="{
              background: schedule[day].some(i => start>= i.bt   && start+59 <= i.et) ? '#dcdada' : '#ffffff',
              cursor: 'pointer'
            }"
          @mousedown="handleMouseDown(day, start)"
          @mouseenter="handleMouseEnter(day, start)"
        />
      </tr>
      </tbody>
    </table>

    <div class="wrapBtn">
      <button @click="onHandleClear" style="margin-top:10px">Clear</button>
      <button @click="onHandleExportToJson" style="margin-top:10px">Save Changes</button>
    </div>
  </div>
</template>
<style scoped>
.container{
  width: max-content;
}
table{
  color: #4d4d4d;
}
td, th {
  height: 32px;
  width: 12px;
  border: 1px solid #afafaf;
}
.cellBtnAll{
  padding: 0;
  cursor: pointer;
  background-color: #939292 ;

}
svg{
  display: flex;
  justify-self: center;
}
.wrapBtn{
  display: flex;
  justify-content: end;
}
.wrapBtn button{
  cursor: pointer;
  color: white;
  border: none;
  background-color: #b2b2b2;
  padding: 4px 16px;
  border-radius: 5px;
  margin-left: 8px;
}
.wrapBtn button:hover{
  background-color: #919090;
}
</style>
