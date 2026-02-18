import { useState, useCallback } from 'react';
import { movementsService } from '../services/movements';

export const useMovements = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMovements = useCallback(async () => {
        setLoading(true);
        try {
            const data = await movementsService.getAll();
            setMovements(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching movements:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addMovement = async (movement) => {
        try {
            const newMov = await movementsService.create(movement);
            setMovements(prev => [newMov, ...prev]);
            return newMov;
        } catch (err) {
            console.error('Error adding movement:', err);
            throw err;
        }
    };

    const updateMovement = async (id, movement) => {
        try {
            const updated = await movementsService.update(id, movement);
            setMovements(prev => prev.map(m => m.id === id ? updated : m));
            return updated;
        } catch (err) {
            console.error('Error updating movement:', err);
            throw err;
        }
    };

    const deleteMovement = async (id) => {
        try {
            await movementsService.delete(id);
            setMovements(prev => prev.map(m => m.id === id ? { ...m, _deleted: true } : m).filter(m => !m._deleted));
            return true;
        } catch (err) {
            console.error('Error deleting movement:', err);
            throw err;
        }
    };

    const confirmMovement = async (id) => {
        try {
            const updated = await movementsService.confirm(id);
            setMovements(prev => prev.map(m => m.id === id ? updated : m));
            return updated;
        } catch (err) {
            console.error('Error confirming movement:', err);
            throw err;
        }
    };

    return {
        movements,
        loading,
        error,
        fetchMovements,
        addMovement,
        updateMovement,
        deleteMovement,
        confirmMovement
    };
};
