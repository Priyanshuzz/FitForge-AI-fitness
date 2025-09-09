'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera,
  Upload,
  Calendar,
  Eye,
  Download,
  Trash2,
  ArrowLeftRight,
  Grid,
  List,
  Plus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  category: 'front' | 'side' | 'back' | 'progress';
  notes?: string;
  weight_kg?: number;
}

interface ProgressPhotosProps {
  userId: string;
  onTakePhoto?: () => void;
}

// Mock photos data - replace with actual API calls
const mockPhotos: ProgressPhoto[] = [
  {
    id: '1',
    url: '/api/placeholder/300/400',
    date: '2024-01-01',
    category: 'front',
    notes: 'Starting point',
    weight_kg: 75.0
  },
  {
    id: '2',
    url: '/api/placeholder/300/400',
    date: '2024-01-15',
    category: 'front',
    notes: '2 weeks progress',
    weight_kg: 73.5
  },
  {
    id: '3',
    url: '/api/placeholder/300/400',
    date: '2024-02-01',
    category: 'front',
    notes: '1 month progress',
    weight_kg: 72.0
  },
  {
    id: '4',
    url: '/api/placeholder/300/400',
    date: '2024-01-01',
    category: 'side',
    notes: 'Starting side view',
    weight_kg: 75.0
  }
];

export function ProgressPhotos({ userId, onTakePhoto }: ProgressPhotosProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(mockPhotos);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'all', label: 'All Photos' },
    { value: 'front', label: 'Front View' },
    { value: 'side', label: 'Side View' },
    { value: 'back', label: 'Back View' },
    { value: 'progress', label: 'Progress' }
  ];

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Handle file upload logic here
      console.log('Files to upload:', files);
    }
  };

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleComparePhotos = () => {
    if (selectedPhotos.length >= 2) {
      setShowComparison(true);
    }
  };

  const PhotoCard = ({ photo }: { photo: ProgressPhoto }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative group cursor-pointer ${
        selectedPhotos.includes(photo.id) ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => handlePhotoSelect(photo.id)}
    >
      <Card className="overflow-hidden">
        <div className="relative">
          <img
            src={photo.url}
            alt={`Progress photo from ${photo.date}`}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {photo.category}
              </Badge>
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-white text-sm font-medium">
                {new Date(photo.date).toLocaleDateString()}
              </div>
              {photo.weight_kg && (
                <div className="text-white/80 text-xs">
                  {photo.weight_kg} kg
                </div>
              )}
            </div>
          </div>
          {selectedPhotos.includes(photo.id) && (
            <div className="absolute top-2 left-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {selectedPhotos.indexOf(photo.id) + 1}
                </span>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          {photo.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {photo.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const PhotoListItem = ({ photo }: { photo: ProgressPhoto }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border rounded-lg p-4 cursor-pointer ${
        selectedPhotos.includes(photo.id) ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={() => handlePhotoSelect(photo.id)}
    >
      <div className="flex items-center space-x-4">
        <img
          src={photo.url}
          alt={`Progress photo from ${photo.date}`}
          className="w-16 h-16 object-cover rounded"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium">
              {new Date(photo.date).toLocaleDateString()}
            </span>
            <Badge variant="outline" className="text-xs">
              {photo.category}
            </Badge>
            {photo.weight_kg && (
              <Badge variant="secondary" className="text-xs">
                {photo.weight_kg} kg
              </Badge>
            )}
          </div>
          {photo.notes && (
            <p className="text-sm text-muted-foreground">{photo.notes}</p>
          )}
        </div>
        {selectedPhotos.includes(photo.id) && (
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {selectedPhotos.indexOf(photo.id) + 1}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Progress Photos</h3>
          <p className="text-sm text-muted-foreground">
            Visual tracking of your transformation journey
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button onClick={onTakePhoto}>
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Actions */}
      {selectedPhotos.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedPhotos.length} photo{selectedPhotos.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                {selectedPhotos.length >= 2 && (
                  <Button size="sm" onClick={handleComparePhotos}>
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Compare
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedPhotos([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map(category => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredPhotos.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium mb-2">No photos yet</h4>
                <p className="text-muted-foreground mb-4">
                  Start documenting your progress by taking or uploading photos
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={onTakePhoto}>
                    <Camera className="w-4 h-4 mr-2" />
                    Take First Photo
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
                : 'space-y-3'
            }>
              <AnimatePresence>
                {filteredPhotos.map(photo => (
                  viewMode === 'grid' ? (
                    <PhotoCard key={photo.id} photo={photo} />
                  ) : (
                    <PhotoListItem key={photo.id} photo={photo} />
                  )
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Photo Comparison Modal */}
      <AnimatePresence>
        {showComparison && selectedPhotos.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-background rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Photo Comparison</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowComparison(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {selectedPhotos.slice(0, 2).map((photoId, index) => {
                  const photo = photos.find(p => p.id === photoId);
                  if (!photo) return null;
                  
                  return (
                    <div key={photoId} className="text-center">
                      <img
                        src={photo.url}
                        alt={`Progress photo ${index + 1}`}
                        className="w-full h-80 object-cover rounded-lg mb-4"
                      />
                      <div className="space-y-2">
                        <div className="font-medium">
                          {new Date(photo.date).toLocaleDateString()}
                        </div>
                        {photo.weight_kg && (
                          <Badge variant="secondary">
                            {photo.weight_kg} kg
                          </Badge>
                        )}
                        {photo.notes && (
                          <p className="text-sm text-muted-foreground">
                            {photo.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}