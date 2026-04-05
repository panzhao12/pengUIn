import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { DialogInput, NoteRecord, RecordedNote } from '@/types';
import { supabase } from '@/database';

export const useRecordStore = defineStore('recordStore', () => {
  const records = ref<Map<number, NoteRecord>>(new Map());

  function parsePosition(pos: any): { x: number; y: number } | null {
    if (!pos) return null;
    if (typeof pos === 'string') {
      try {
        return JSON.parse(pos);
      } catch (e) {
        return null;
      }
    }
    return { x: pos.x || 0, y: pos.y || 0 };
  }

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
          position: parsePosition(data.position) || { x: 50, y: 50 },
          createTime: data.created_at
        })
      );
    }
  }

  async function saveRecord(
    input: DialogInput,
    recordedNotes: RecordedNote[],
    position?: { x: number; y: number }
  ) {
    const payload: any = {
      title: input.title,
      description: input.description,
      record: recordedNotes
    };

    if (position) {
      payload.position = position;
    }

    const { data, error } = await supabase
      .from('records')
      .insert([payload])
      .select();

    if (error) {
      console.error('Error saving record:', error);
    } else {
      records.value.set(data[0].id, {
        title: data[0].title,
        description: data[0].description,
        record: data[0].record as any as RecordedNote[],
        position: position ||
          parsePosition(data[0].position) || { x: 50, y: 50 },
        createTime: data[0].created_at
      });
      // Force an update to Supabase strictly to ensure the DB registers it, just in case INSERT dropped it
      if (position) {
        updateRecordPosition(data[0].id, position);
      }
      console.log('Record saved successfully:', data[0]);
    }
  }

  async function updateRecordPosition(
    id: number,
    input: { x: number; y: number }
  ) {
    const { data, error } = await supabase
      .from('records')
      .update({
        position: input
      } as any)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating record:', error);
    } else {
      records.value.set(id, {
        title: data[0].title,
        description: data[0].description,
        record: data[0].record as any as RecordedNote[],
        position: parsePosition(data[0].position) || { x: 50, y: 50 },
        createTime: data[0].created_at
      });
      console.log('Record updated successfully:', data[0]);
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
  async function deleteRecord(id: number) {
    const { error } = await supabase.from('records').delete().eq('id', id);

    if (error) {
      console.error('Error deleting record:', error);
    } else {
      records.value.delete(id);
      console.log('Record deleted successfully:', id);
    }
  }

  return {
    records,
    getAllRecords,
    saveRecord,
    updateRecordPosition,
    deleteRecord
  };
});
