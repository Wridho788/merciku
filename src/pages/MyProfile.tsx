import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useProfile, useUpdateProfile, useUploadImage,
  //  useCity,
    useCart } from '../api/hooks/index';
import { useAuthStore } from '../stores/authStore';
import './AccountPages.css';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, token: authToken } = useAuthStore();

  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const PULL_THRESHOLD = 80;
  const MAX_PULL_DISTANCE = 120;

  const [formData, setFormData] = useState({
    tname: '',
    tphone1: '',
    temail: '',
    taddress: '',
    tzip: '',
    ccity: '',
    tprofession: '',
    torganization: '',
    tinstagram: '',
    tdob: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // API hooks
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadImage();
  // const { data: cityData, isLoading: cityLoading, error: cityError } = useCity();
  // API hooks for cart
  const {
    data: apiCartData,
    refetch: cartRefetch,
  } = useCart();
  // Populate form data when profile data is loaded
  useEffect(() => {
    if (profileData?.content?.result) {
      const profile = profileData.content.result;
      setFormData({
        tname: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        tphone1: profile.phone1 || '',
        temail: profile.email || '',
        taddress: profile.address || '',
        tzip: profile.zip || '',
        ccity: profile.city || '',
        tprofession: profile.profession || '',
        torganization: profile.organization || '',
        tinstagram: profile.instagram || '',
        tdob: profile.dob || '',
      });
    }
  }, [profileData]);
   const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };

    const apiCartCount = getApiCartCount();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Pull to refresh handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    },
    [isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || startY.current === null || isRefreshing) return;

      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0 && window.scrollY === 0) {
        e.preventDefault();
        // Apply resistance effect for more natural feel
        const resistance = Math.max(0.3, 1 - diff / 300);
        const distance = Math.min(diff * resistance, MAX_PULL_DISTANCE);
        setPullDistance(distance);
      }
    },
    [isRefreshing],
  );

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > PULL_THRESHOLD && !isRefreshing) {
      triggerRefresh();
    }
    pulling.current = false;
    startY.current = null;
    setTimeout(() => setPullDistance(0), 200);
  }, [pullDistance, isRefreshing]);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Refresh profile and city data in parallel
      const refreshPromises = [];

      // Refresh profile data
      if (refetchProfile) refreshPromises.push(refetchProfile());

      // Refresh cart data
      if (cartRefetch) refreshPromises.push(cartRefetch());

      // Note: City data is typically static, but we can refresh it too
      // If useCity hook has refetch capability, we would add it here

      // Wait for all refreshes to complete
      await Promise.allSettled(refreshPromises);
    } catch (error) {
      console.error('❌ Pull to refresh error on MyProfile:', error);
    } finally {
      // Add a small delay to show the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [isRefreshing, refetchProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pulling.current = false;
      startY.current = null;
      setPullDistance(0);
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      temail: value,
    }));

    // Validate email format if field is not empty
    if (value.trim() !== '' && !validateEmail(value)) {
      toast.warning('Please enter a valid email address (e.g., user@example.com)', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authToken) {
      if (!authToken) {
        toast.warning('Please login first', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
      }
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF)', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    try {
      await uploadImageMutation.mutateAsync({ file, authToken });
      toast.success('Profile image updated successfully!', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });

      setIsRefreshing(true);
      try {
        await refetchProfile();
      } finally {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    } catch (error) {
      toast.error('Failed to upload image', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!authToken) {
      toast.warning('Please login first', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    // Validasi required fields
    if (
      !formData.tprofession.trim() ||
      !formData.torganization.trim() ||
      !formData.tinstagram.trim() ||
      !formData.taddress.trim() ||
      !formData.tdob.trim()
    ) {
      toast.warning('Field Profession, Organization, Instagram, Address, dan Date of Birth wajib diisi!', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    // Validasi email format jika email diisi
    if (formData.temail.trim() !== '' && !validateEmail(formData.temail)) {
      toast.error('Please enter a valid email address (e.g., user@example.com)', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    try {
      // Prepare payload with current form data (allow empty values)
      const payload = {
        tprofession: formData.tprofession,
        torganization: formData.torganization,
        tinstagram: formData.tinstagram,
        taddress: formData.taddress,
        tzip: formData.tzip,
        temail: formData.temail,
        tdob: formData.tdob,
        ccity: formData.ccity,
      };
      await updateProfileMutation.mutateAsync({
        data: payload,
      });
      toast.success('Profile updated successfully!', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });

      setIsRefreshing(true);
      try {
        await refetchProfile();
      } finally {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
navigate('/cart');  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <>
      <AppbarDefault
        title="Profil Saya"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={apiCartCount}
      />
      <div
        className="account-page"
        ref={pullRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pulling.current ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {/* Pull to Refresh Indicator */}
        {(pullDistance > 0 || isRefreshing) && (
          <div
            style={{
              position: 'fixed',
              top: pullDistance > 0 ? `${Math.max(0, pullDistance - 60)}px` : '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '8px 16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#666',
              transition: 'all 0.2s ease-out',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ddd',
                borderTop: '2px solid #007bff',
                borderRadius: '50%',
                animation: isRefreshing
                  ? 'spin 1s linear infinite'
                  : pullDistance > PULL_THRESHOLD
                    ? 'spin 1s linear infinite'
                    : 'none',
                transform:
                  !isRefreshing && pullDistance <= PULL_THRESHOLD
                    ? `rotate(${(pullDistance / PULL_THRESHOLD) * 360}deg)`
                    : 'none',
              }}
            />
            {isRefreshing
              ? 'Refreshing profile...'
              : pullDistance > PULL_THRESHOLD
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </div>
        )}

        <div className="account-content">
          <div className="account-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={
                    profileData?.content?.result?.image_url &&
                    profileData.content.result.image_url !==
                      'http://mbapi.dswip.com/images/customer/'
                      ? profileData.content.result.image_url
                      : '/lapakbenz.png'
                  }
                  alt="Profile"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ddd',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={handleImageClick}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/lapakbenz.png';
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.8';
                    (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '1';
                    (e.target as HTMLImageElement).style.transform = 'scale(1)';
                  }}
                />
                {uploadImageMutation.isPending && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    Uploading...
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    background: '#007bff',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                  onClick={handleImageClick}
                  title="Change profile picture"
                >
                  📷
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
            <h3>Informasi Profil Saya</h3>

            {profileLoading && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p>Memuat data profil...</p>
              </div>
            )}

            {profileError && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#dc3545' }}>
                <p>Gagal memuat profil: {profileError.message}</p>
              </div>
            )}

            {!profileLoading && !profileError && (
              <>
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.tname}
                    onChange={(e) => handleInputChange('tname', e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>
                <div className="form-group">
                  <label>No. HP</label>
                  <input
                    type="tel"
                    value={formData.tphone1}
                    onChange={(e) => handleInputChange('tphone1', e.target.value)}
                    placeholder="Contoh: +62 xxx-xxxx-xxxx"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.temail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="email.anda@email.com"
                  />
                </div>
                <div className="form-group">
                  <label>Alamat</label>
                  <textarea
                    value={formData.taddress}
                    onChange={(e) => handleInputChange('taddress', e.target.value)}
                    placeholder="Masukkan alamat lengkap Anda"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Kode Pos</label>
                  <input
                    type="text"
                    value={formData.tzip}
                    onChange={(e) => handleInputChange('tzip', e.target.value)}
                    placeholder="Masukkan kode pos"
                  />
                </div>
                <div className="form-group">
                  <label>Kota</label>
                  {/* <select
                    value={formData.ccity}
                    onChange={(e) => handleInputChange('ccity', e.target.value)}
                    disabled={cityLoading}
                  >
                    <option value="">{cityLoading ? 'Memuat daftar kota...' : 'Pilih Kota'}</option>
                    {cityError && (
                      <option value="" disabled>
                        Gagal memuat kota
                      </option>
                    )}
                    {cityData &&
                      (() => {
                        // Handle different possible data structures
                        let cities = [];

                        if (Array.isArray(cityData)) {
                          cities = cityData;
                        } else if (
                          cityData.content?.result &&
                          Array.isArray(cityData.content.result)
                        ) {
                          cities = cityData.content.result;
                        } else if (Array.isArray(cityData.content)) {
                          cities = cityData.content;
                        } else if (cityData.data && Array.isArray(cityData.data)) {
                          cities = cityData.data;
                        } else if (cityData.result && Array.isArray(cityData.result)) {
                          cities = cityData.result;
                        }

                        if (cities.length === 0) {
                          return (
                            <option value="" disabled>
                              Tidak ada kota tersedia
                            </option>
                          );
                        }

                        return cities.map((city: any, index: number) => {
                          // Handle different city object structures
                          const cityId = city.id || city.city_id || city.value || index;
                          const cityName =
                            city.name ||
                            city.city_name ||
                            city.label ||
                            city.text ||
                            `Kota ${index + 1}`;

                          return (
                            <option key={cityId} value={cityId}>
                              {cityName}
                            </option>
                          );
                        });
                      })()}
                  </select> */}
                </div>
                <div className="form-group">
                  <label>Profesi</label>
                  <input
                    type="text"
                    value={formData.tprofession}
                    onChange={(e) => handleInputChange('tprofession', e.target.value)}
                    placeholder="Masukkan profesi Anda"
                  />
                </div>
                <div className="form-group">
                  <label>Organisasi</label>
                  <input
                    type="text"
                    value={formData.torganization}
                    onChange={(e) => handleInputChange('torganization', e.target.value)}
                    placeholder="Masukkan organisasi/perusahaan Anda"
                  />
                </div>
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="text"
                    value={formData.tinstagram}
                    onChange={(e) => handleInputChange('tinstagram', e.target.value)}
                    placeholder="@username"
                  />
                </div>
                <div className="form-group">
                  <label>Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tdob}
                    onChange={(e) => handleInputChange('tdob', e.target.value)}
                  />
                </div>
                <button className="save-btn" onClick={handleUpdateProfile}>
                  {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </>
            )}
          </div>
        </div>

        <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
      </div>
    </>
  );
};

export default MyProfile;