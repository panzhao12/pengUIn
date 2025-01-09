import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { DialogInput, NoteRecord, RecordedNote } from '@/types';
import { supabase } from '@/database';

export const useRecordStore = defineStore('recordStore', () => {
  const records = ref<Map<string, NoteRecord>>(new Map());

  async function getAllRecords() {
    const { data, error } = await supabase.from('records').select('*');

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      console.log({ data });
      data.forEach(({ id, ...data }) =>
        records.value.set(id, {
          title: data.title,
          description: data.description,
          record: data.record as any as RecordedNote[],
          createTime: data.create_time
        })
      );
    }
  }

  async function saveRecord(input: DialogInput, recordedNotes: RecordedNote[]) {
    const { data, error } = await supabase
      .from('records')
      .insert([
        {
          title: input.title,
          description: input.description,
          record: recordedNotes
        }
      ] as any)
      .select();

    if (error) {
      console.error('Error saving record:', error);
    } else {
      records.value.set(data[0].id, {
        title: data[0].title,
        description: data[0].description,
        record: data[0].record as any as RecordedNote[],
        createTime: data[0].create_time
      });
      console.log('Record saved successfully:', data[0]);
    }
  }

  // function subscribeToRecording() {
  //   supabase
  //     .from('messages')
  //     .on('INSERT', (payload) => {
  //       this.messages.unshift(payload.new); // Automatically update messages
  //     })
  //     .subscribe();
  // },
  return { records, getAllRecords, saveRecord };
});
