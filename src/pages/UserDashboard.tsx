import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { PopularBusinessCard } from "@/components/PopularBusinessCard";
import { supabase } from "@/integrations/supabase/client";
import BusinessForm from "@/components/BusinessForm";
import { addDays, format } from "date-fns";
import { 
  User, 
  Mail, 
  Heart, 
  Building2, 
  Plus, 
  Globe, 
  CreditCard, 
  LogOut,
  Home,
  Edit
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sidebarItems = [
  { title: "Dashboard", icon: Home, action: "dashboard" },
  { title: "Profile Info", icon: User, action: "profile" },
  { title: "Email Settings", icon: Mail, action: "email" },
  { title: "Wishlists", icon: Heart, action: "wishlists" },
  { title: "My Listings", icon: Building2, action: "listings" },
  { title: "Add Listing", icon: Plus, action: "add-listing" },
  { title: "Get Website + POS", icon: Globe, action: "website-pos" },
  { title: "Subscription", icon: CreditCard, action: "subscription" },
];

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [userBusinesses, setUserBusinesses] = React.useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingBusiness, setEditingBusiness] = React.useState(null);

  const fetchUserBusinesses = async () => {
    if (!user?.id) return;
    
    setLoadingBusinesses(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user businesses:', error);
        return;
      }
      
      setUserBusinesses(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleSidebarAction = (action: string) => {
    setActiveSection(action);
    
    if (action === "website-pos") {
      navigate("/list-&-get-pos-website");
    } else if (action === "listings" || action === "subscription") {
      fetchUserBusinesses();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleEditBusiness = (business: any) => {
    setEditingBusiness(business);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditingBusiness(null);
    fetchUserBusinesses();
  };

  const getDashboardContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {profile?.display_name || "No display name set"}
                    </h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      Role: {profile?.role || "user"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "email":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Email Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Primary Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Email verified: {user?.email_confirmed_at ? "Yes" : "No"}
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "wishlists":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Wishlists</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  No wishlists created yet. Start exploring businesses to create your first wishlist!
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "listings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Business Listings</h2>
            {loadingBusinesses ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading your businesses...</p>
              </div>
            ) : userBusinesses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userBusinesses.map((business) => (
                  <div key={business.id} className="relative">
                    <Button
                      onClick={() => handleEditBusiness(business)}
                      className="absolute top-2 left-2 z-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-2 py-1 h-auto text-xs rounded"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <PopularBusinessCard business={business} />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    No business listings yet. 
                    <Button 
                      variant="link" 
                      className="ml-2 p-0 h-auto"
                      onClick={() => navigate("/list-business")}
                    >
                      Create your first listing
                    </Button>
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "add-listing":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Add New Business Listing</h2>
            <BusinessForm onSuccess={() => {
              setActiveSection("listings");
              fetchUserBusinesses();
            }} />
          </div>
        );

      case "subscription":
        const activePOSBusinesses = userBusinesses.filter(business => business["POS+Website"] === 1);
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Subscription</h2>
            <Card>
              <CardHeader>
                <CardTitle>Business Listing</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBusinesses ? (
                  <p className="text-muted-foreground">Loading businesses...</p>
                ) : userBusinesses.length === 0 ? (
                  <>
                    <p className="text-lg font-medium">Not Active</p>
                    <p className="text-muted-foreground mt-2">
                      Upgrade to unlock premium features and boost your business visibility.
                    </p>
                    <Button className="mt-4">List Your Business($2/Year)</Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg font-medium text-green-600">Active Listing(s)</p>
                    <div className="space-y-3">
                      {userBusinesses.map((business) => {
                        const expirationDate = addDays(new Date(business.created_at), 365);
                        return (
                          <div key={business.id} className="border rounded-lg p-3 bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-foreground">{business.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Expires: {format(expirationDate, 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>POS + Website</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBusinesses ? (
                  <p className="text-muted-foreground">Loading businesses...</p>
                ) : activePOSBusinesses.length === 0 ? (
                  <>
                    <p className="text-lg font-medium">Not Active</p>
                    <p className="text-muted-foreground mt-2">
                      Get a complete business solution with Point of Sale system and professional website.
                    </p>
                    <Button className="mt-4">Get Started</Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg font-medium text-green-600">Active POS + Website</p>
                    <div className="space-y-3">
                      {activePOSBusinesses.map((business) => {
                        const odooExpiredDate = business.odoo_expired_date 
                          ? new Date(business.odoo_expired_date)
                          : addDays(new Date(business.created_at), 7);
                        return (
                          <div key={business.id} className="border rounded-lg p-3 bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-foreground">{business.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Odoo software expired date: {format(odooExpiredDate, 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Welcome to Your Dashboard</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    My Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Wishlists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Saved businesses</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">Free</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upgrade
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  const AppSidebar = () => (
    <Sidebar className="border-r">
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">wellfinds</span>
          </Link>
        </div>
        
        {/* User Info Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {profile?.display_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleSidebarAction(item.action)}
                    isActive={activeSection === item.action}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Please sign in to access your dashboard.</p>
            <Button 
              onClick={() => navigate("/auth/signin")} 
              className="w-full mt-4"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <SidebarTrigger />
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {profile?.display_name || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            {getDashboardContent()}
          </main>
        </SidebarProvider>
      </div>
      
      {/* Edit Business Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Listing</DialogTitle>
          </DialogHeader>
          {editingBusiness && (
            <BusinessForm 
              editingBusiness={editingBusiness}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}