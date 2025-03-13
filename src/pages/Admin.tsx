
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, SubscriptionList, Campaign, SmtpSettings } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Admin: {user.name}</span>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="lists">
          <TabsList className="mb-6">
            <TabsTrigger value="lists">Subscription Lists</TabsTrigger>
            <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
            <TabsTrigger value="settings">SMTP Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lists">
            <SubscriptionListsTab />
          </TabsContent>
          
          <TabsContent value="campaigns">
            <CampaignsTab />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Subscription Lists Tab
const SubscriptionListsTab = () => {
  const { getLists, createList, addSubscriberToList, removeSubscriberFromList } = useSubscription();
  const [lists, setLists] = useState<SubscriptionList[]>([]);
  
  // New list dialog
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  
  // Add subscriber dialog
  const [isAddSubscriberDialogOpen, setIsAddSubscriberDialogOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscriberName, setSubscriberName] = useState('');
  const [isAddingSubscriber, setIsAddingSubscriber] = useState(false);

  // Load lists
  useEffect(() => {
    setLists(getLists());
  }, [getLists]);

  // Create new list
  const handleCreateList = async () => {
    setIsCreatingList(true);
    try {
      await createList(newListName, newListDescription);
      setLists(getLists());
      setIsNewListDialogOpen(false);
      setNewListName('');
      setNewListDescription('');
    } catch (error) {
      // Error handled in context
    } finally {
      setIsCreatingList(false);
    }
  };

  // Add subscriber to list
  const handleAddSubscriber = async () => {
    setIsAddingSubscriber(true);
    try {
      await addSubscriberToList(subscriberEmail, subscriberName, selectedListId);
      setLists(getLists());
      setIsAddSubscriberDialogOpen(false);
      setSubscriberEmail('');
      setSubscriberName('');
    } catch (error) {
      // Error handled in context
    } finally {
      setIsAddingSubscriber(false);
    }
  };

  // Remove subscriber from list
  const handleRemoveSubscriber = async (listId: string, subscriberId: string) => {
    try {
      await removeSubscriberFromList(subscriberId, listId);
      setLists(getLists());
    } catch (error) {
      // Error handled in context
    }
  };

  // Open add subscriber dialog
  const openAddSubscriberDialog = (listId: string) => {
    setSelectedListId(listId);
    setIsAddSubscriberDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Subscription Lists</h2>
        <Button onClick={() => setIsNewListDialogOpen(true)}>Create New List</Button>
      </div>
      
      {lists.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No subscription lists found. Create your first list to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {lists.map((list) => (
            <div key={list.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium">{list.name}</h3>
                  <p className="text-gray-500">{list.description}</p>
                  <p className="text-gray-500 mt-1">
                    {list.subscribers.length} subscribers
                  </p>
                </div>
                <Button onClick={() => openAddSubscriberDialog(list.id)}>
                  Add Subscriber
                </Button>
              </div>
              
              {list.subscribers.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.subscribers.map((subscriberId) => (
                      <TableRow key={subscriberId}>
                        <TableCell>John Doe</TableCell>
                        <TableCell>john@example.com</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveSubscriber(list.id, subscriberId)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New List Dialog */}
      <Dialog open={isNewListDialogOpen} onOpenChange={setIsNewListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subscription List</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Newsletter Subscribers"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="list-description">Description</Label>
              <Textarea
                id="list-description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Brief description of this list"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewListDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList} disabled={isCreatingList || !newListName}>
              {isCreatingList ? 'Creating...' : 'Create List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subscriber Dialog */}
      <Dialog open={isAddSubscriberDialogOpen} onOpenChange={setIsAddSubscriberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscriber to List</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subscriber-email">Email</Label>
              <Input
                id="subscriber-email"
                type="email"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscriber-name">Name</Label>
              <Input
                id="subscriber-name"
                value={subscriberName}
                onChange={(e) => setSubscriberName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubscriberDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSubscriber} 
              disabled={isAddingSubscriber || !subscriberEmail || !subscriberName}
            >
              {isAddingSubscriber ? 'Adding...' : 'Add Subscriber'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Campaigns Tab
const CampaignsTab = () => {
  const { 
    getCampaigns, 
    getLists,
    createCampaign, 
    updateCampaign, 
    deleteCampaign,
    sendCampaign 
  } = useSubscription();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [lists, setLists] = useState<SubscriptionList[]>([]);
  
  // New campaign dialog
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  
  // Send campaign dialog
  const [isSendCampaignDialogOpen, setIsSendCampaignDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [bccEmails, setBccEmails] = useState('');
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);

  // Load campaigns and lists
  useEffect(() => {
    setCampaigns(getCampaigns());
    setLists(getLists());
  }, [getCampaigns, getLists]);

  // Create new campaign
  const handleCreateCampaign = async () => {
    setIsCreatingCampaign(true);
    try {
      await createCampaign(campaignName, selectedListIds, campaignSubject, campaignContent);
      setCampaigns(getCampaigns());
      setIsNewCampaignDialogOpen(false);
      resetCampaignForm();
    } catch (error) {
      // Error handled in context
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Send campaign
  const handleSendCampaign = async () => {
    setIsSendingCampaign(true);
    try {
      const ccArray = ccEmails ? ccEmails.split(',').map(email => email.trim()) : [];
      const bccArray = bccEmails ? bccEmails.split(',').map(email => email.trim()) : [];
      
      await sendCampaign(selectedCampaignId, { cc: ccArray, bcc: bccArray });
      setIsSendCampaignDialogOpen(false);
      resetSendCampaignForm();
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSendingCampaign(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(campaignId);
        setCampaigns(getCampaigns());
      } catch (error) {
        // Error handled in context
      }
    }
  };

  // Toggle list selection
  const toggleListSelection = (listId: string) => {
    if (selectedListIds.includes(listId)) {
      setSelectedListIds(selectedListIds.filter(id => id !== listId));
    } else {
      setSelectedListIds([...selectedListIds, listId]);
    }
  };

  // Open send campaign dialog
  const openSendCampaignDialog = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setIsSendCampaignDialogOpen(true);
  };

  // Reset form values
  const resetCampaignForm = () => {
    setCampaignName('');
    setSelectedListIds([]);
    setCampaignSubject('');
    setCampaignContent('');
  };

  const resetSendCampaignForm = () => {
    setSelectedCampaignId('');
    setCcEmails('');
    setBccEmails('');
  };

  // Get list names for a campaign
  const getListNamesForCampaign = (campaign: Campaign) => {
    return campaign.listIds.map(id => {
      const list = lists.find(l => l.id === id);
      return list ? list.name : 'Unknown List';
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Email Campaigns</h2>
        <Button onClick={() => setIsNewCampaignDialogOpen(true)}>Create New Campaign</Button>
      </div>
      
      {campaigns.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No campaigns found. Create your first campaign to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium">{campaign.name}</h3>
                  <p className="text-gray-500 mt-1">
                    <strong>Lists:</strong> {getListNamesForCampaign(campaign)}
                  </p>
                  <p className="text-gray-500">
                    <strong>Subject:</strong> {campaign.subject}
                  </p>
                  <p className="text-gray-500">
                    <strong>Created:</strong> {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => openSendCampaignDialog(campaign.id)}>
                    Send Campaign
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <h4 className="font-medium mb-2">Email Content:</h4>
                <div className="text-sm border p-3 bg-white rounded">
                  {campaign.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Campaign Dialog */}
      <Dialog open={isNewCampaignDialogOpen} onOpenChange={setIsNewCampaignDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Email Campaign</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Monthly Newsletter"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Select Lists</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                {lists.length === 0 ? (
                  <p className="text-gray-500 text-sm">No lists available</p>
                ) : (
                  <div className="space-y-2">
                    {lists.map((list) => (
                      <div key={list.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`list-${list.id}`}
                          checked={selectedListIds.includes(list.id)}
                          onChange={() => toggleListSelection(list.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`list-${list.id}`} className="text-sm">
                          {list.name} ({list.subscribers.length} subscribers)
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-subject">Email Subject</Label>
              <Input
                id="campaign-subject"
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                placeholder="Subject line for your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-content">Email Content</Label>
              <Textarea
                id="campaign-content"
                value={campaignContent}
                onChange={(e) => setCampaignContent(e.target.value)}
                placeholder="HTML content for your email"
                className="min-h-[200px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCampaignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCampaign} 
              disabled={
                isCreatingCampaign || 
                !campaignName || 
                selectedListIds.length === 0 || 
                !campaignSubject || 
                !campaignContent
              }
            >
              {isCreatingCampaign ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Campaign Dialog */}
      <Dialog open={isSendCampaignDialogOpen} onOpenChange={setIsSendCampaignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cc-emails">CC (Optional)</Label>
              <Input
                id="cc-emails"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
              />
              <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bcc-emails">BCC (Optional)</Label>
              <Input
                id="bcc-emails"
                value={bccEmails}
                onChange={(e) => setBccEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
              />
              <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendCampaignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendCampaign} disabled={isSendingCampaign}>
              {isSendingCampaign ? 'Sending...' : 'Send Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Settings Tab
const SettingsTab = () => {
  const { updateSmtpSettings, getSmtpSettings } = useSubscription();
  
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<'ssl' | 'tls' | 'none'>('tls');
  const [isSaving, setIsSaving] = useState(false);

  // Load settings
  useEffect(() => {
    const settings = getSmtpSettings();
    if (settings) {
      setHost(settings.host || '');
      setPort(String(settings.port) || '587');
      setUsername(settings.username || '');
      setPassword(settings.password || '');
      setEncryption(settings.encryption || 'tls');
    }
  }, [getSmtpSettings]);

  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSmtpSettings({
        host,
        port: Number(port),
        username,
        password,
        encryption
      });
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">SMTP Settings</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="smtp-host">SMTP Host</Label>
          <Input
            id="smtp-host"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="e.g., smtp.gmail.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smtp-port">SMTP Port</Label>
          <Input
            id="smtp-port"
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="e.g., 587"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smtp-username">SMTP Username</Label>
          <Input
            id="smtp-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., your-email@gmail.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smtp-password">SMTP Password</Label>
          <Input
            id="smtp-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your SMTP password or app password"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smtp-encryption">Encryption Method</Label>
          <select
            id="smtp-encryption"
            value={encryption}
            onChange={(e) => setEncryption(e.target.value as 'ssl' | 'tls' | 'none')}
            className="w-full border rounded-md h-10 px-3"
          >
            <option value="ssl">SSL</option>
            <option value="tls">TLS</option>
            <option value="none">None</option>
          </select>
        </div>
        
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default Admin;
