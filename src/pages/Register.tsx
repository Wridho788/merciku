import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPersonAdd } from 'react-icons/md';
import { MdCalendarToday } from 'react-icons/md';
import { AppbarAuth } from '../components/AppbarAuth';
import { useRegister, useChapters } from '../api/hooks/index';
import { toast } from 'react-toastify';
import './Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [registrationType, setRegistrationType] = useState<'member' | 'participant' | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    chapter: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    zip: '',
    city: '',
    dob: '',
    nik: '',
    vehicleType: '',
    policeNo: '',
    password: '',
    confirmPassword: '',
    agree: '',
  });

  // Hooks for API calls
  const registerMutation = useRegister();
  const { data: chaptersData, isLoading: chaptersLoading, error: chaptersError } = useChapters();


  // State for loading and error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (chaptersError) {
      console.error('Error loading chapters:', chaptersError);
    }
    // if (citiesError) {
    //   console.error('Error loading cities:', citiesError);
    // }
  }, [chaptersError]);


  const handleRegistrationTypeChange = (type: 'member' | 'participant') => {
    setRegistrationType(type);
    // Reset chapter when switching to participant
    if (type === 'participant') {
      setFormData(prev => ({
        ...prev,
        chapter: '999' // Set chapter ID to 999 for non-member participants
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        chapter: '' // Reset chapter for member selection
      }));
    }
  };

  const handleContinueToForm = () => {
    if (!registrationType) {
      toast.warning('Silakan pilih tipe pendaftaran terlebih dahulu', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }
    setShowForm(true);
  };

  const handleBackToSelection = () => {
    setShowForm(false);
    // Reset form data when going back
    setFormData({
      chapter: registrationType === 'participant' ? '999' : '',
      fullName: '',
      phone: '',
      email: '',
      address: '',
      zip: '',
      city: '',
      dob: '',
      nik: '',
      vehicleType: '',
      policeNo: '',
      password: '',
      confirmPassword: '',
      agree: '',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    let fieldValue = value;
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked ? 'true' : '';
    }
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!registrationType) {
      toast.warning('Silakan pilih tipe pendaftaran (Member atau Participant)', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    if (registrationType === 'member' && !formData.chapter) {
      toast.warning('Silakan pilih chapter untuk pendaftaran member', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    // Member-specific validation
    if (registrationType === 'member') {
      if (!formData.vehicleType) {
        toast.warning('Jenis kendaraan Mercedes-Benz wajib diisi untuk member', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
        return;
      }
      if (!formData.policeNo) {
        toast.warning('Nomor polisi wajib diisi untuk member', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
        return;
      }
      if (!formData.nik) {
        toast.warning('NIK wajib diisi untuk member', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    if (formData.agree !== 'true') {
      toast.warning('Please agree to the terms and conditions', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API according to RegisterRequest interface
      const registerData = {
        cchapter: registrationType === 'participant' ? '999' : formData.chapter,
        tname: formData.fullName,
        tphone1: formData.phone,
        temail: formData.email,
        taddress: formData.address,
        tzip: formData.zip,
        ccity: formData.city,
        tdob: formData.dob,
        tnik: formData.nik,
        tcartype: formData.vehicleType,
        tpoliceno: formData.policeNo,
        tpassword: formData.password,
      };

      const result = await registerMutation.mutateAsync(registerData);

      // Show success message with toast
      toast.success('Registration Successful! Your registration will be processed offline by admin.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/verify', {
        state: {
          username: registerData.tphone1,
          id_customer: result.content?.id // dari response register/request OTP
        }
      });
    } catch (error: any) {
      console.error('Registration failed:', error);

      // Handle different types of errors
      let errorMessage = 'Registration failed. Please try again.';

      // Check if it's an Axios error with response
      if (error?.response?.data) {
        const errorData = error.response.data;

        // Check for specific error format
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error message with toast
      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/login');
  };



  return (
    <div className="register-page">
      <AppbarAuth
        title={!showForm ? "Pilih Tipe Pendaftaran" : `Daftar ${registrationType === 'member' ? 'Member' : 'Peserta'}`}
        onBack={showForm ? handleBackToSelection : handleBackClick}
      />
      <div className="register-card">
        {!showForm ? (
          <>
            {/* Registration Type Selection Screen */}
            <h1 className="register-title">Daftar Sebagai Apa?</h1>
            <p className="register-subtitle">Pilih tipe pendaftaran yang sesuai dengan kebutuhan Anda</p>

            <div className="registration-type-container">
              <div className="registration-type-options">
                <label className={`registration-type-option ${registrationType === 'member' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="registrationType"
                    value="member"
                    checked={registrationType === 'member'}
                    onChange={() => handleRegistrationTypeChange('member')}
                    className="registration-type-radio"
                  />
                  <div className="registration-type-content">
                    <div className="registration-type-icon">👥</div>
                    <div className="registration-type-text">
                      <h4>Member Komunitas</h4>
                      <p>Anggota resmi Mercedes-Benz Club dengan akses penuh ke semua fitur komunitas</p>
                      <ul className="registration-benefits">
                        <li>✓ Akses ke semua event eksklusif</li>
                        <li>✓ Fitur komunitas lengkap</li>
                        <li>✓ Networking dengan sesama member</li>
                        <li>✓ Merchandise club eksklusif</li>
                      </ul>
                    </div>
                  </div>
                </label>

                <label className={`registration-type-option ${registrationType === 'participant' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="registrationType"
                    value="participant"
                    checked={registrationType === 'participant'}
                    onChange={() => handleRegistrationTypeChange('participant')}
                    className="registration-type-radio"
                  />
                  <div className="registration-type-content">
                    <div className="registration-type-icon">👤</div>
                    <div className="registration-type-text">
                      <h4>Peserta Umum</h4>
                      <p>Peserta umum yang dapat mengikuti event-event terbuka untuk umum</p>
                      <ul className="registration-benefits">
                        <li>✓ Akses ke event publik</li>
                        <li>✓ Pendaftaran event mudah</li>
                        <li>✓ Notifikasi event terbaru</li>
                        <li>✓ Komunitas yang ramah</li>
                      </ul>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="button"
              className="continue-button"
              onClick={handleContinueToForm}
              disabled={!registrationType}
            >
              <span>
                {registrationType ? `Lanjut sebagai ${registrationType === 'member' ? 'Member' : 'Peserta'}` : 'Pilih tipe pendaftaran'}
              </span>
              <span className="continue-arrow">→</span>
            </button>
          </>
        ) : (
          <>
            {/* Registration Form Screen */}
            <h1 className="register-title">
              {registrationType === 'member' ? 'Daftar Member Komunitas' : 'Daftar Peserta Umum'}
            </h1>
            <p className="register-subtitle">
              {registrationType === 'member'
                ? 'Lengkapi data untuk menjadi anggota resmi Mercedes-Benz Club'
                : 'Lengkapi data untuk dapat mengikuti event-event kami'
              }
            </p>

            <form>
              {/* Registration Type Badge */}
              <div className="selected-type-badge">
                <span className="badge-icon">
                  {registrationType === 'member' ? '👥' : '👤'}
                </span>
                <span className="badge-text">
                  {registrationType === 'member' ? 'Member Komunitas' : 'Peserta Umum'}
                </span>
              </div>

              {/* Chapter Dropdown - Only show for member */}
              {registrationType === 'member' && (
                <div className="form-group">
                  <label htmlFor="chapter" className="form-label">
                    Chapter / Club
                  </label>
                  <select
                    id="chapter"
                    name="chapter"
                    value={formData.chapter}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={chaptersLoading}
                  >
                    <option value="">
                      {chaptersLoading ? 'Memuat chapter...' : 'Pilih Chapter'}
                    </option>
                    {chaptersData?.content?.result?.map((chapter: any) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.code} - {chapter.name}
                      </option>
                    )) || []}
                    {/* Fallback options if API fails */}
                    {chaptersError && !chaptersData && [
                      <option key="MBW202.05" value="MBW202.05">MBW202.05 - MERCEDESBENZ W202 CHAPTER MEDAN</option>,
                      <option key="MBCL" value="MBCL">MBCL - MERCEDES BENZ CLUB LAMPUNG</option>,
                      <option key="MBCPKU" value="MBCPKU">MBCPKU - MERCEDES BENZ CLUB PEKAN BARU</option>
                    ]}
                  </select>
                  {chaptersError && (
                    <small style={{ color: 'red', fontSize: '12px' }}>
                      Error loading chapters. Using fallback options.
                    </small>
                  )}
                </div>
              )}

              {/* Info message for participant */}
              {registrationType === 'participant' && (
                <div className="participant-info">
                  <div className="info-card">
                    <div className="info-icon">ℹ️</div>
                    <div className="info-text">
                      <p><strong>Peserta Umum:</strong> Anda akan terdaftar sebagai peserta umum dan dapat mengikuti event-event yang dibuka untuk umum.</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Name */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>
              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Masukkan nomor HP Anda"
                  pattern="[0-9]+"
                  required
                />
              </div>
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Masukkan email Anda"
                  required
                />
              </div>
              {/* Address */}
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Alamat
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Masukkan alamat Anda"
                  required
                  rows={2}
                />
              </div>
              {/* Zip Code */}
              <div className="form-group">
                <label htmlFor="zip" className="form-label">
                  Kode Pos
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Masukkan kode pos Anda"
                  pattern="[0-9]+"
                  required
                />
              </div>
              {/* City Dropdown */}
              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  Kota
                </label>
                {/* <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={citiesLoading}
                >
                  <option value="">
                    {citiesLoading ? 'Memuat kota...' : 'Pilih Kota'}
                  </option> */}
                  {/* {citiesData?.content?.map((city: any) => (
                    <option key={city.id} value={city.id}>
                      {city.nama}
                    </option>
                  )) || []} */}
                  {/* Fallback options if API fails */}
                  {/* {citiesError && !citiesData && [
                    <option key="aceh" value="aceh">Aceh</option>,
                    <option key="medan" value="medan">Medan</option>,
                    <option key="jakarta" value="jakarta">Jakarta</option>,
                    <option key="bandung" value="bandung">Bandung</option>,
                    <option key="surabaya" value="surabaya">Surabaya</option>
                  ]} */}
                {/* </select> */}
                {/* {citiesError && (
                  <small style={{ color: 'red', fontSize: '12px' }}>
                    Error loading cities. Using fallback options.
                  </small>
                )} */}
              </div>
              {/* DOB Date Picker */}
              <div className="form-group">
                <label htmlFor="dob" className="form-label">
                  Tanggal Lahir
                </label>
                <div className="dob-picker-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="form-input dob-input"
                    required
                    style={{ paddingRight: 36 }}
                  />
                  <MdCalendarToday style={{ position: 'absolute', right: 12, color: '#888', pointerEvents: 'none', fontSize: 22 }} />
                </div>
              </div>
              {/* NIK - Required for Member, Optional for Participant */}
              <div className="form-group">
                <label htmlFor="nik" className="form-label">
                  NIK {registrationType === 'participant' && <span className="optional-label">(Opsional)</span>}
                </label>
                <input
                  type="text"
                  id="nik"
                  name="nik"
                  value={formData.nik}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Masukkan NIK Anda"
                  pattern="[0-9]+"
                  required={registrationType === 'member'}
                />
              </div>

              {/* Vehicle Information - Different for Member vs Participant */}
              {registrationType === 'member' ? (
                <>
                  {/* Vehicle Type - Required for Member */}
                  <div className="form-group">
                    <label htmlFor="vehicleType" className="form-label">
                      Jenis Kendaraan Mercedes-Benz
                    </label>
                    <input
                      type="text"
                      id="vehicleType"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Contoh: W202, W124, W190, C-Class, E-Class"
                      required
                    />
                    <small className="field-help">
                      Masukkan tipe Mercedes-Benz yang Anda miliki
                    </small>
                  </div>
                  {/* Police No - Required for Member */}
                  <div className="form-group">
                    <label htmlFor="policeNo" className="form-label">
                      Nomor Polisi
                    </label>
                    <input
                      type="text"
                      id="policeNo"
                      name="policeNo"
                      value={formData.policeNo}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Contoh: B 1234 ABC"
                      required
                    />
                    <small className="field-help">
                      Nomor polisi kendaraan Mercedes-Benz Anda
                    </small>
                  </div>
                </>
              ) : (
                <>
                  {/* Vehicle Type - Optional for Participant */}
                  <div className="form-group">
                    <label htmlFor="vehicleType" className="form-label">
                      Jenis Kendaraan <span className="optional-label">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      id="vehicleType"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Contoh: Toyota Avanza, Honda Jazz, dll"
                    />
                    <small className="field-help">
                      Boleh kosong jika tidak memiliki kendaraan
                    </small>
                  </div>
                  {/* Police No - Optional for Participant */}
                  <div className="form-group">
                    <label htmlFor="policeNo" className="form-label">
                      Nomor Polisi <span className="optional-label">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      id="policeNo"
                      name="policeNo"
                      value={formData.policeNo}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Contoh: B 1234 ABC"
                    />
                    <small className="field-help">
                      Boleh kosong jika tidak memiliki kendaraan
                    </small>
                  </div>
                </>
              )}
              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Kata Sandi
                </label>
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input password-input"
                  placeholder="Masukkan kata sandi Anda"
                  required
                />
              </div>
              {/* Password Again */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Ulangi Kata Sandi
                </label>
                <input
                  type="text"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input password-input"
                  placeholder="Ulangi kata sandi Anda"
                  required
                />
              </div>
              {/* Terms & Conditions Radio */}
              <div className="form-group terms-group">
                <div className="terms-container">
                  <label htmlFor="agree" className="terms-label">
                    <input
                      type="radio"
                      id="agree"
                      name="agree"
                      value="true"
                      checked={formData.agree === 'true'}
                      onChange={handleInputChange}
                      className="terms-radio"
                      required
                    />
                    <span className="radio-custom">
                      <span className="radio-dot"></span>
                    </span>
                    <span className="terms-text">
                      Saya setuju dengan <span className="terms-link">syarat dan ketentuan</span>
                    </span>
                  </label>
                </div>
              </div>
              {/* Register Button */}
              <button
                type="submit"
                className="register-button dark-bg"
                onClick={handleRegister}
                disabled={isSubmitting || chaptersLoading  || !registrationType}
              >
                <span style={{ color: '#fff' }}>
                  {isSubmitting ? 'Sedang mendaftar...' : `Daftar sebagai ${registrationType === 'member' ? 'Member' : registrationType === 'participant' ? 'Peserta' : 'Pilih Tipe'}`}
                </span>
                <MdPersonAdd className="register-icon" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;