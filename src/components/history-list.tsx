"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrapingResult } from "@/types";
import { formatDate, truncateString } from "@/lib/utils";
import { Trash2, TrashIcon, CheckSquare, Square } from "lucide-react";

interface HistoryListProps {
    items: ScrapingResult[];
    isLoading?: boolean;
    onItemsDeleted?: () => void;
}

export function HistoryList({ items, isLoading = false, onItemsDeleted }: HistoryListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);

    // Filter items based on search term
    const filteredItems = searchTerm
        ? items.filter(item =>
            item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.title?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        )
        : items;

    // Delete functions
    const handleDeleteSingle = async (id: string) => {
        setIsDeleting(true);
        try {
            const response = await fetch('/api/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                onItemsDeleted?.();
            } else {
                console.error('Failed to delete item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteMultiple = async () => {
        if (selectedItems.size === 0) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedItems) }),
            });

            if (response.ok) {
                setSelectedItems(new Set());
                setIsSelectMode(false);
                onItemsDeleted?.();
            } else {
                console.error('Failed to delete items');
            }
        } catch (error) {
            console.error('Error deleting items:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelectItem = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(item => item.id)));
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Scraping History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <svg
                            className="animate-spin h-8 w-8 text-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Scraping History</CardTitle>
                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSelectMode(!isSelectMode)}
                                className="flex items-center gap-2"
                            >
                                {isSelectMode ? <Square className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                                {isSelectMode ? 'Cancel' : 'Select'}
                            </Button>
                        )}
                        {isSelectMode && selectedItems.size > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={isDeleting}
                                        className="flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Selected ({selectedItems.size})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete {selectedItems.size} selected item{selectedItems.size > 1 ? 's' : ''}?
                                            This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteMultiple}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 space-y-2">
                    <input
                        type="text"
                        placeholder="Search by URL or title..."
                        className="w-full p-2 border rounded-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSelectMode && filteredItems.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleSelectAll}
                                className="flex items-center gap-2"
                            >
                                {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                            </Button>
                            <span className="text-sm text-gray-500">
                                {selectedItems.size} of {filteredItems.length} selected
                            </span>
                        </div>
                    )}
                </div>

                {filteredItems.length > 0 ? (
                    <div className="space-y-2">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="relative">
                                <div className={`border rounded-md p-3 transition-colors ${isSelectMode ? 'hover:bg-muted' : ''
                                    } ${selectedItems.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        {isSelectMode && (
                                            <Checkbox
                                                checked={selectedItems.has(item.id)}
                                                onCheckedChange={() => toggleSelectItem(item.id)}
                                                className="mt-1"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/results/${item.id}`}
                                                className={`block ${isSelectMode ? 'pointer-events-none' : 'hover:bg-muted rounded-md -m-1 p-1'}`}
                                            >
                                                <div className="font-medium">
                                                    {truncateString(item.title || "Untitled Page", 60)}
                                                </div>
                                                <div className="text-sm text-muted-foreground truncate">
                                                    {item.url}
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDate(new Date(item.createdAt))}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                                            {item.headings.length} Headings
                                                        </span>
                                                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                                            {item.links.length} Links
                                                        </span>
                                                        {item.issues.length > 0 && (
                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                                {item.issues.length} Issues
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                        {!isSelectMode && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                                                        disabled={isDeleting}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Scraped Data</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this scraped data for "{truncateString(item.title || item.url, 50)}"?
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteSingle(item.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        {searchTerm ? (
                            <div>
                                <p>No results found for "{searchTerm}"</p>
                                <Button
                                    variant="link"
                                    onClick={() => setSearchTerm("")}
                                    className="mt-2"
                                >
                                    Clear search
                                </Button>
                            </div>
                        ) : (
                            <p>No scraping history yet. Start by scraping a website!</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 