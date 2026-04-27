import React, { useState } from 'react';
import './AturPengiriman.css';
import { useProvince, useCityByProvince, useDistrictByCity, useSetShipping } from '../api/hooks/index';

interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
  province_id: string;
}

interface District {
  id: string;
  name: string;
  city_id: string;
}

interface FormData {
  selectedProvince: Province | null;
  selectedCity: City | null;
  selectedDistrict: District | null;
  address: string;
}

interface AturPengirimanProps {
  onSuccess?: () => void;
}

const AturPengiriman: React.FC<AturPengirimanProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    selectedProvince: null,
    selectedCity: null,
    selectedDistrict: null,
    address: '',
  });

  // API Hooks - Start with province data
  const { data: provinceData, isLoading: provinceLoading } = useProvince();
  
  // City data - only fetch when province is selected
  const { data: cityData, isLoading: cityLoading } = useCityByProvince(
    formData.selectedProvince?.id || null
  );
  
  // District data - only fetch when city is selected
  const { data: districtData, isLoading: districtLoading } = useDistrictByCity(
    formData.selectedCity?.id || null
  );
  
  const setShippingMutation = useSetShipping();


  // Note: Reset logic handled in change handlers to avoid infinite re-renders

  const handleProvinceChange = () => {
    // const provinceId = e.target.value;
    
    // if (provinceId && provinceData?.content) {
    //   // Find province by ID (convert string ID to number for comparison)
    //   const province = provinceData.content.find((p: any) => p.id.toString() === provinceId);
      
    //   if (province) {
    //     setFormData(prev => ({
    //       ...prev,
    //       selectedProvince: {
    //         id: province.id.toString(),
    //         name: province.name
    //       },
    //       // Reset dependent fields
    //       selectedCity: null,
    //       selectedDistrict: null,
    //     }));
    //   }
    // } else {
    //   setFormData(prev => ({
    //     ...prev,
    //     selectedProvince: null,
    //     selectedCity: null,
    //     selectedDistrict: null,
    //   }));
    // }
  };

  const handleCityChange = () => {
    // const cityId = e.target.value;
    // if (cityId && cityData?.content) {
    //   // Find city by ID (convert string ID to number for comparison)
    //   const city = cityData.content.find((c: any) => c.id.toString() === cityId);
      
    //   if (city) {
    //     setFormData(prev => ({
    //       ...prev,
    //       selectedCity: {
    //         id: city.id.toString(),
    //         name: city.name,
    //         province_id: formData.selectedProvince?.id || ''
    //       },
    //       // Reset dependent field
    //       selectedDistrict: null,
    //     }));
    //   }
    // } else {
    //   setFormData(prev => ({
    //     ...prev,
    //     selectedCity: null,
    //     selectedDistrict: null,
    //   }));
    // }
  };

  const handleDistrictChange = () => {
    // const districtId = e.target.value;
    // if (districtId && districtData?.content) {
    //   // Find district by ID (convert string ID to number for comparison)
    //   const district = districtData.content.find((d: any) => d.id.toString() === districtId);
      
    //   if (district) {
    //     setFormData(prev => ({
    //       ...prev,
    //       selectedDistrict: {
    //         id: district.id.toString(),
    //         name: district.name,
    //         city_id: formData.selectedCity?.id || ''
    //       },
    //     }));
    //   }
    // } else {
    //   setFormData(prev => ({
    //     ...prev,
    //     selectedDistrict: null,
    //   }));
    // }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      address: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - only province, city, and district are required
    if (!formData.selectedProvince || !formData.selectedCity || !formData.selectedDistrict) {
      alert('Mohon pilih Provinsi, Kota/Kabupaten, dan Kecamatan');
      return;
    }

    const payload = {
      province: formData.selectedProvince.id,
      city: formData.selectedCity.id,
      district: formData.selectedDistrict.id,
      province_name: formData.selectedProvince.name,
      city_name: formData.selectedCity.name,
      district_name: formData.selectedDistrict.name,
      address: formData.address.trim() || '', // Address is optional, use empty string if not provided
      ccity: formData.selectedCity.id,
    };

    try {
      await setShippingMutation.mutateAsync(payload);
      alert('Alamat pengiriman berhasil disimpan!');
      
      // Reset form
      setFormData({
        selectedProvince: null,
        selectedCity: null,
        selectedDistrict: null,
        address: '',
      });

      // Call onSuccess callback if provided (to close modal)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error setting shipping:', error);
      alert('Gagal menyimpan alamat pengiriman. Silakan coba lagi.');
    }
  };

  // Helper functions to determine element states
  const isCityDropdownEnabled = () => {
    return !cityLoading && !!formData.selectedProvince && !!cityData?.content;
  };

  const isDistrictDropdownEnabled = () => {
    return !districtLoading && !!formData.selectedCity && !!districtData?.content;
  };

  const isTextAreaEnabled = () => {
    return formData.selectedDistrict !== null;
  };

  const isSubmitEnabled = () => {
    return formData.selectedProvince && formData.selectedCity && formData.selectedDistrict && !setShippingMutation.isPending;
  };

  return (
    <div className="atur-pengiriman">
      <div className="atur-pengiriman__container">
        <h2 className="atur-pengiriman__title">Atur Alamat Pengiriman</h2>
        
        <form onSubmit={handleSubmit} className="atur-pengiriman__form">
          {/* Province Dropdown */}
          <div className="form-group">
            <label htmlFor="province" className="form-label">
              Provinsi <span className="required">*</span>
            </label>
            <select
              id="province"
              value={formData.selectedProvince?.id || ''}
              onChange={handleProvinceChange}
              disabled={provinceLoading}
              className="form-select"
              required
            >
              <option value="">
                {provinceLoading ? 'Memuat provinsi...' : 'Pilih Provinsi'}
              </option>
              {provinceData?.content?.map((province: any) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              Kota/Kabupaten <span className="required">*</span>
            </label>
            <select
              id="city"
              value={formData.selectedCity?.id || ''}
              onChange={handleCityChange}
              disabled={!isCityDropdownEnabled()}
              className="form-select"
              required
            >
              <option value="">
                {!formData.selectedProvince
                  ? 'Pilih provinsi terlebih dahulu'
                  : cityLoading
                  ? 'Memuat kota/kabupaten...'
                  : !cityData?.content
                  ? 'Tidak ada data kota'
                  : 'Pilih Kota/Kabupaten'}
              </option>
              {cityData?.content?.map((city: any) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div className="form-group">
            <label htmlFor="district" className="form-label">
              Kecamatan <span className="required">*</span>
            </label>
            <select
              id="district"
              value={formData.selectedDistrict?.id || ''}
              onChange={handleDistrictChange}
              disabled={!isDistrictDropdownEnabled()}
              className="form-select"
              required
            >
              <option value="">
                {!formData.selectedCity
                  ? 'Pilih kota/kabupaten terlebih dahulu'
                  : districtLoading
                  ? 'Memuat kecamatan...'
                  : !districtData?.content
                  ? 'Tidak ada data kecamatan'
                  : 'Pilih Kecamatan'}
              </option>
              {districtData?.content?.map((district: any) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {/* Address Textarea */}
          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Alamat Lengkap <span className="optional">(Opsional)</span>
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={handleAddressChange}
              disabled={!isTextAreaEnabled()}
              className="form-textarea"
              placeholder={
                !isTextAreaEnabled() 
                  ? "Pilih kecamatan terlebih dahulu untuk mengisi alamat"
                  : "Masukkan alamat lengkap (nama jalan, nomor rumah, RT/RW, dll.) - Opsional"
              }
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isSubmitEnabled()}
            className="submit-button"
          >
            {setShippingMutation.isPending ? 'Menyimpan...' : 'Simpan Alamat'}
          </button>

          {/* Loading/Error States */}
          {setShippingMutation.isError && (
            <div className="error-message">
              Terjadi kesalahan saat menyimpan alamat. Silakan coba lagi.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AturPengiriman;