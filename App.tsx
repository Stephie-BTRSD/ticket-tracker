import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Fixed: Import from package
import { Ionicons } from '@expo/vector-icons';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'Created' | 'Under Assistance' | 'Completed';
  rating?: number; // 1-5, only for Completed
}

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      title: 'Login Issue',
      description: 'User cannot log in with email.',
      status: 'Created',
    },
    {
      id: '2',
      title: 'Payment Bug',
      description: 'Stripe integration failing on iOS.',
      status: 'Under Assistance',
    },
    {
      id: '3',
      title: 'UI Feedback',
      description: 'Improve dashboard layout.',
      status: 'Completed',
      rating: 4,
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Created' | 'Under Assistance' | 'Completed'>('Created');

  const openModal = (ticket?: Ticket) => {
    if (ticket) {
      setIsEditing(true);
      setCurrentId(ticket.id);
      setTitle(ticket.title);
      setDescription(ticket.description);
      setStatus(ticket.status);
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setTitle('');
      setDescription('');
      setStatus('Created');
    }
    setModalVisible(true);
  };

  const saveTicket = () => {
    if (isEditing && currentId) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === currentId ? { ...t, title, description, status, rating: status === 'Completed' ? t.rating : undefined } : t
        )
      );
    } else {
      const newTicket: Ticket = {
        id: Date.now().toString(),
        title,
        description,
        status,
      };
      setTickets((prev) => [...prev, newTicket]);
    }
    setModalVisible(false);
  };

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const updateRating = (id: string, newRating: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, rating: newRating } : t))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ticket Tracker</Text>
      </View>
      <View style={styles.content}>
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TicketItem
              ticket={item}
              onEdit={() => openModal(item)}
              onDelete={() => deleteTicket(item.id)}
              onUpdateRating={(rating) => updateRating(item.id, rating)}
            />
          )}
        />
      </View>
      <Pressable style={styles.addButton} onPress={() => openModal()}>
        <Text style={styles.addButtonText}>Add Ticket</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Ticket' : 'Add Ticket'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <Picker
              selectedValue={status}
              onValueChange={(itemValue: 'Created' | 'Under Assistance' | 'Completed') => setStatus(itemValue)} // Fixed: Typed param
              style={styles.picker}
            >
              <Picker.Item label="Created" value="Created" />
              <Picker.Item label="Under Assistance" value="Under Assistance" />
              <Picker.Item label="Completed" value="Completed" />
            </Picker>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={saveTicket}>
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface TicketItemProps {
  ticket: Ticket;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateRating: (rating: number) => void;
}

const TicketItem: React.FC<TicketItemProps> = ({ ticket, onEdit, onDelete, onUpdateRating }) => {
  const statusColor = {
    Created: 'blue',
    'Under Assistance': 'orange',
    Completed: 'green',
  }[ticket.status];

  return (
    <View style={styles.ticketRow}>
      <Text style={styles.ticketTitle}>{ticket.title}</Text>
      <Text style={styles.ticketDescription}>{ticket.description}</Text>
      <Text style={[styles.ticketStatus, { color: statusColor }]}>Status: {ticket.status}</Text>
      {ticket.status === 'Completed' && (
        <Rating rating={ticket.rating || 0} onChange={onUpdateRating} />
      )}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="pencil" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={{ marginLeft: 16 }}>
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface RatingProps {
  rating: number;
  onChange: (newRating: number) => void;
}

const Rating: React.FC<RatingProps> = ({ rating, onChange }) => {
  return (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={24}
            color="gold"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  ticketRow: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ticketStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    borderRadius: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
});