import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => {
    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-50 border border-slate-200 dark:border-slate-300 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all shadow-sm outline-none"
                placeholder={placeholder || 'Buscar...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
