'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Form, Button, Card, Row, Col, Stack, Accordion } from 'react-bootstrap';
import { FaFilter, FaChevronDown, FaChevronUp, FaSearch, FaTimes } from 'react-icons/fa';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya'
];

export default function ProfileFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize openSections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gender: true,
    age: true,
    height: true,
    districts: true
  });

  // Initialize filter states
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '18');
  const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '70');
  const [heightMin, setHeightMin] = useState(searchParams.get('heightMin') || '150');
  const [heightMax, setHeightMax] = useState(searchParams.get('heightMax') || '200');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
    searchParams.getAll('districts') || []
  );
  const [districtSearch, setDistrictSearch] = useState('');

  // Update states when URL parameters change
  useEffect(() => {
    setGender(searchParams.get('gender') || '');
    setAgeMin(searchParams.get('ageMin') || '18');
    setAgeMax(searchParams.get('ageMax') || '70');
    setHeightMin(searchParams.get('heightMin') || '150');
    setHeightMax(searchParams.get('heightMax') || '200');
    setSelectedDistricts(searchParams.getAll('districts') || []);
  }, [searchParams]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district) 
        : [...prev, district]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    
    const perPage = searchParams.get('perPage');
    if (perPage) params.set('perPage', perPage);
    
    if (gender) params.set('gender', gender);
    if (ageMin !== '18') params.set('ageMin', ageMin);
    if (ageMax !== '70') params.set('ageMax', ageMax);
    if (heightMin !== '150') params.set('heightMin', heightMin);
    if (heightMax !== '200') params.set('heightMax', heightMax);
    
    selectedDistricts.forEach(district => {
      params.append('districts', district);
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setGender('');
    setAgeMin('18');
    setAgeMax('70');
    setHeightMin('150');
    setHeightMax('200');
    setSelectedDistricts([]);
    setDistrictSearch('');
    
    const params = new URLSearchParams();
    const perPage = searchParams.get('perPage');
    if (perPage) params.set('perPage', perPage);
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Filter districts based on search input
  const filteredDistricts = DISTRICTS.filter(district =>
    district.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center">
          <FaFilter className="me-2" />
          <Card.Title className="mb-0 fs-5 fw-semibold">Filter Profiles</Card.Title>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => {
            const allOpen = Object.values(openSections).every(v => v);
            setOpenSections({
              gender: !allOpen,
              age: !allOpen,
              height: !allOpen,
              districts: !allOpen
            });
          }}
          className="text-white text-decoration-none p-0"
        >
          {Object.values(openSections).every(v => v) ? 'Collapse All' : 'Expand All'}
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <Accordion activeKey={Object.keys(openSections).filter(key => openSections[key])} flush>
          {/* Gender Filter */}
          <Accordion.Item eventKey="gender" className="border-0">
            <Accordion.Header onClick={() => toggleSection('gender')} className="px-3 py-2 border-bottom">
              <div className="d-flex justify-content-between w-100 pe-2 align-items-center">
                <span className="fw-medium">Gender</span>
                {openSections.gender ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </div>
            </Accordion.Header>
            <Accordion.Body className="px-3 py-3">
              <Stack direction="horizontal" gap={3} className="flex-wrap">
                <Form.Check
                  type="radio"
                  id="gender-male"
                  label="Male"
                  name="gender"
                  value="MALE"
                  checked={gender === 'MALE'}
                  onChange={(e) => setGender(e.target.value)}
                  className="me-3"
                />
                <Form.Check
                  type="radio"
                  id="gender-female"
                  label="Female"
                  name="gender"
                  value="FEMALE"
                  checked={gender === 'FEMALE'}
                  onChange={(e) => setGender(e.target.value)}
                  className="me-3"
                />
                <Form.Check
                  type="radio"
                  id="gender-any"
                  label="Any"
                  name="gender"
                  value=""
                  checked={gender === ''}
                  onChange={() => setGender('')}
                />
              </Stack>
            </Accordion.Body>
          </Accordion.Item>

          {/* Age Range Filter */}
          <Accordion.Item eventKey="age" className="border-0">
            <Accordion.Header onClick={() => toggleSection('age')} className="px-3 py-2 border-bottom">
              <div className="d-flex justify-content-between w-100 pe-2 align-items-center">
                <span className="fw-medium">Age Range</span>
                {openSections.age ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </div>
            </Accordion.Header>
            <Accordion.Body className="px-3 py-3">
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                  <Form.Control
                    type="number"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    min="18"
                    max="100"
                    style={{ width: '80px' }}
                    className="flex-shrink-0"
                  />
                  <span className="text-muted">to</span>
                  <Form.Control
                    type="number"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    min="18"
                    max="100"
                    style={{ width: '80px' }}
                    className="flex-shrink-0"
                  />
                  <span className="text-muted">years</span>
                </div>
                <Form.Range
                  min={18}
                  max={100}
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  className="mt-2"
                />
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* Height Range Filter */}
          <Accordion.Item eventKey="height" className="border-0">
            <Accordion.Header onClick={() => toggleSection('height')} className="px-3 py-2 border-bottom">
              <div className="d-flex justify-content-between w-100 pe-2 align-items-center">
                <span className="fw-medium">Height Range (cm)</span>
                {openSections.height ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </div>
            </Accordion.Header>
            <Accordion.Body className="px-3 py-3">
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                  <Form.Control
                    type="number"
                    value={heightMin}
                    onChange={(e) => setHeightMin(e.target.value)}
                    min="100"
                    max="250"
                    style={{ width: '80px' }}
                    className="flex-shrink-0"
                  />
                  <span className="text-muted">to</span>
                  <Form.Control
                    type="number"
                    value={heightMax}
                    onChange={(e) => setHeightMax(e.target.value)}
                    min="100"
                    max="250"
                    style={{ width: '80px' }}
                    className="flex-shrink-0"
                  />
                  <span className="text-muted">cm</span>
                </div>
                <Form.Range
                  min={100}
                  max={250}
                  value={heightMax}
                  onChange={(e) => setHeightMax(e.target.value)}
                  className="mt-2"
                />
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* Districts Filter */}
          <Accordion.Item eventKey="districts" className="border-0">
            <Accordion.Header onClick={() => toggleSection('districts')} className="px-3 py-2 border-bottom">
              <div className="d-flex justify-content-between w-100 pe-2 align-items-center">
                <span className="fw-medium">Districts</span>
                {openSections.districts ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </div>
            </Accordion.Header>
            <Accordion.Body className="px-3 py-3">
              <div className="mb-3 position-relative">
                <Form.Control
                  type="text"
                  placeholder="Search districts..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="ps-4"
                />
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                {districtSearch && (
                  <Button
                    variant="link"
                    className="position-absolute top-50 end-0 translate-middle-y p-0 me-2 text-muted"
                    onClick={() => setDistrictSearch('')}
                  >
                    <FaTimes size={14} />
                  </Button>
                )}
              </div>
              
              <div className="d-flex flex-wrap gap-2">
                {filteredDistricts.map((district) => (
                  <Button
                    key={district}
                    variant={selectedDistricts.includes(district) ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => toggleDistrict(district)}
                    className="rounded-pill"
                  >
                    {district}
                  </Button>
                ))}
              </div>
              
              {filteredDistricts.length === 0 && (
                <div className="text-muted text-center py-2">No districts found</div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Action Buttons */}
        <div className="p-3 border-top bg-light">
          <Stack direction="horizontal" gap={3} className="justify-content-between">
            <Button 
              variant="outline-danger" 
              onClick={resetFilters}
              size="sm"
              className="d-flex align-items-center gap-1"
            >
              <FaTimes size={12} />
              Reset All
            </Button>
            <Button 
              variant="primary" 
              onClick={applyFilters}
              size="sm"
              className="d-flex align-items-center gap-1"
            >
              <FaSearch size={12} />
              Apply Filters
            </Button>
          </Stack>
        </div>
      </Card.Body>
    </Card>
  );
}
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { Form, Button, Card, Row, Col, Stack } from 'react-bootstrap';

// // Define districts available in your application
// const DISTRICTS = [
//   'Central District', 'Eastern District', 'Western District', 
//   'Southern District', 'Northern District', 'Northwestern District',
//   'Northeastern District', 'Southwestern District', 'Kurunegala'
// ];

// export default function ProfileFilter() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
  
//   // Initialize state from URL params
//   const [gender, setGender] = useState(searchParams.get('gender') || '');
//   const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '18');
//   const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '70');
//   const [heightMin, setHeightMin] = useState(searchParams.get('heightMin') || '150');
//   const [heightMax, setHeightMax] = useState(searchParams.get('heightMax') || '200');
//   const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
//     searchParams.getAll('districts') || []
//   );

//   // Update local state when URL parameters change
//   useEffect(() => {
//     setGender(searchParams.get('gender') || '');
//     setAgeMin(searchParams.get('ageMin') || '18');
//     setAgeMax(searchParams.get('ageMax') || '70');
//     setHeightMin(searchParams.get('heightMin') || '150');
//     setHeightMax(searchParams.get('heightMax') || '200');
//     setSelectedDistricts(searchParams.getAll('districts') || []);
//   }, [searchParams]);

//   // Handle district selection toggle
//   const toggleDistrict = (district: string) => {
//     setSelectedDistricts(prev => 
//       prev.includes(district) 
//         ? prev.filter(d => d !== district) 
//         : [...prev, district]
//     );
//   };

//   // Apply filters
//   const applyFilters = () => {
//     const params = new URLSearchParams();
    
//     // Reset to page 1 when applying filters
//     params.set('page', '1');
    
//     // Add current perPage if it exists
//     const perPage = searchParams.get('perPage');
//     if (perPage) params.set('perPage', perPage);
    
//     // Add filter values (only if they're not empty or default)
//     if (gender) params.set('gender', gender);
//     if (ageMin !== '18') params.set('ageMin', ageMin);
//     if (ageMax !== '70') params.set('ageMax', ageMax);
//     if (heightMin !== '150') params.set('heightMin', heightMin);
//     if (heightMax !== '200') params.set('heightMax', heightMax);
    
//     // Add multiple districts
//     selectedDistricts.forEach(district => {
//       params.append('districts', district);
//     });

//     router.push(`${pathname}?${params.toString()}`);
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setGender('');
//     setAgeMin('18');
//     setAgeMax('70');
//     setHeightMin('150');
//     setHeightMax('200');
//     setSelectedDistricts([]);
    
//     const params = new URLSearchParams();
//     const perPage = searchParams.get('perPage');
//     if (perPage) params.set('perPage', perPage);
//     params.set('page', '1');
    
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   return (
//     <Card className="mb-4">
//       <Card.Header className="bg-light">
//         <Card.Title className="mb-0 fs-5">Filter Profiles</Card.Title>
//       </Card.Header>
//       <Card.Body>
//         <Form>
//           {/* Gender Filter */}
//           <Form.Group className="mb-3">
//             <Form.Label>Gender</Form.Label>
//             <Stack direction="horizontal" gap={3}>
//               <Form.Check
//                 type="radio"
//                 id="gender-male"
//                 label="Male"
//                 name="gender"
//                 value="MALE"
//                 checked={gender === 'MALE'}
//                 onChange={(e) => setGender(e.target.value)}
//               />
//               <Form.Check
//                 type="radio"
//                 id="gender-female"
//                 label="Female"
//                 name="gender"
//                 value="FEMALE"
//                 checked={gender === 'FEMALE'}
//                 onChange={(e) => setGender(e.target.value)}
//               />
//               <Form.Check
//                 type="radio"
//                 id="gender-any"
//                 label="Any"
//                 name="gender"
//                 value=""
//                 checked={gender === ''}
//                 onChange={() => setGender('')}
//               />
//             </Stack>
//           </Form.Group>

//           {/* Age Range Filter */}
//           <Form.Group className="mb-3">
//             <Form.Label>Age Range</Form.Label>
//             <Stack direction="horizontal" gap={2} className="align-items-center">
//               <Form.Control
//                 type="number"
//                 value={ageMin}
//                 onChange={(e) => setAgeMin(e.target.value)}
//                 min="18"
//                 max="100"
//                 style={{ width: '80px' }}
//               />
//               <span>to</span>
//               <Form.Control
//                 type="number"
//                 value={ageMax}
//                 onChange={(e) => setAgeMax(e.target.value)}
//                 min="18"
//                 max="100"
//                 style={{ width: '80px' }}
//               />
//               <span>years</span>
//             </Stack>
//           </Form.Group>

//           {/* Height Range Filter */}
//           <Form.Group className="mb-3">
//             <Form.Label>Height Range (cm)</Form.Label>
//             <Stack direction="horizontal" gap={2} className="align-items-center">
//               <Form.Control
//                 type="number"
//                 value={heightMin}
//                 onChange={(e) => setHeightMin(e.target.value)}
//                 min="100"
//                 max="250"
//                 style={{ width: '80px' }}
//               />
//               <span>to</span>
//               <Form.Control
//                 type="number"
//                 value={heightMax}
//                 onChange={(e) => setHeightMax(e.target.value)}
//                 min="100"
//                 max="250"
//                 style={{ width: '80px' }}
//               />
//               <span>cm</span>
//             </Stack>
//           </Form.Group>

//           {/* Districts Filter */}
//           <Form.Group className="mb-4">
//             <Form.Label>Districts</Form.Label>
//             <Row xs={2} md={3} className="g-2">
//               {DISTRICTS.map((district) => (
//                 <Col key={district}>
//                   <Form.Check
//                     type="checkbox"
//                     id={`district-${district}`}
//                     label={district}
//                     checked={selectedDistricts.includes(district)}
//                     onChange={() => toggleDistrict(district)}
//                   />
//                 </Col>
//               ))}
//             </Row>
//           </Form.Group>

//           {/* Action Buttons */}
//           <Stack direction="horizontal" gap={3} className="justify-content-end">
//             <Button 
//               variant="outline-secondary" 
//               onClick={resetFilters}
//               size="sm"
//             >
//               Reset
//             </Button>
//             <Button 
//               variant="primary" 
//               onClick={applyFilters}
//               size="sm"
//             >
//               Apply Filters
//             </Button>
//           </Stack>
//         </Form>
//       </Card.Body>
//     </Card>
//   );
// }


// // app/profiles/ProfileFilter.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// // Define districts available in your application
// // Adjust this list to match your actual districts in the Profile model
// const DISTRICTS = [
//   'Central District', 'Eastern District', 'Western District', 
//   'Southern District', 'Northern District', 'Northwestern District',
//   'Northeastern District', 'Southwestern District', 'Kurunegala'
// ];

// export default function ProfileFilter() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
  
//   // Initialize state from URL params
//   const [gender, setGender] = useState(searchParams.get('gender') || '');
//   const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '18');
//   const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '70');
//   const [heightMin, setHeightMin] = useState(searchParams.get('heightMin') || '150');
//   const [heightMax, setHeightMax] = useState(searchParams.get('heightMax') || '200');
//   const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
//     searchParams.getAll('districts') || []
//   );

//   // Update local state when URL parameters change
//   useEffect(() => {
//     setGender(searchParams.get('gender') || '');
//     setAgeMin(searchParams.get('ageMin') || '18');
//     setAgeMax(searchParams.get('ageMax') || '70');
//     setHeightMin(searchParams.get('heightMin') || '150');
//     setHeightMax(searchParams.get('heightMax') || '200');
//     setSelectedDistricts(searchParams.getAll('districts') || []);
//   }, [searchParams]);

//   // Handle district selection toggle
//   const toggleDistrict = (district: string) => {
//     setSelectedDistricts(prev => 
//       prev.includes(district) 
//         ? prev.filter(d => d !== district) 
//         : [...prev, district]
//     );
//   };

//   // Apply filters
//   const applyFilters = () => {
//     // Create a new URLSearchParams object
//     const params = new URLSearchParams();
    
//     // Reset to page 1 when applying filters
//     params.set('page', '1');
    
//     // Add current perPage if it exists
//     const perPage = searchParams.get('perPage');
//     if (perPage) params.set('perPage', perPage);
    
//     // Add filter values (only if they're not empty or default)
//     if (gender) params.set('gender', gender);
//     if (ageMin !== '18') params.set('ageMin', ageMin);
//     if (ageMax !== '70') params.set('ageMax', ageMax);
//     if (heightMin !== '150') params.set('heightMin', heightMin);
//     if (heightMax !== '200') params.set('heightMax', heightMax);
    
//     // Add multiple districts
//     selectedDistricts.forEach(district => {
//       params.append('districts', district);
//     });

//     // Navigate to the same path with updated query params
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setGender('');
//     setAgeMin('18');
//     setAgeMax('70');
//     setHeightMin('150');
//     setHeightMax('200');
//     setSelectedDistricts([]);
    
//     // Navigate to page without filters but keep pagination settings
//     const params = new URLSearchParams();
//     const perPage = searchParams.get('perPage');
//     if (perPage) params.set('perPage', perPage);
//     params.set('page', '1'); // Reset to page 1
    
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   return (
//     <div className="bg-white p-4 rounded-lg shadow mb-6">
//       <h2 className="text-lg font-semibold mb-4">Filter Profiles</h2>
      
//       <div className="space-y-4">
//         {/* Gender Filter */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Gender</label>
//           <div className="flex space-x-4">
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 name="gender"
//                 value="MALE"
//                 checked={gender === 'MALE'}
//                 onChange={(e) => setGender(e.target.value)}
//                 className="mr-2"
//               />
//               Male
//             </label>
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 name="gender"
//                 value="FEMALE"
//                 checked={gender === 'FEMALE'}
//                 onChange={(e) => setGender(e.target.value)}
//                 className="mr-2"
//               />
//               Female
//             </label>
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 name="gender"
//                 value=""
//                 checked={gender === ''}
//                 onChange={() => setGender('')}
//                 className="mr-2"
//               />
//               Any
//             </label>
//           </div>
//         </div>
        
//         {/* Age Range Filter */}
//         <div>
          
//           <label className="block text-sm font-medium mb-1">Age Range</label>
//           <div className="flex items-center space-x-2">
//             <input
//               type="number"
//               value={ageMin}
//               onChange={(e) => setAgeMin(e.target.value)}
//               min="18"
//               max="100"
//               className="w-20 px-2 py-1 border rounded"
//             />
//             <span>to</span>
//             <input
//               type="number"
//               value={ageMax}
//               onChange={(e) => setAgeMax(e.target.value)}
//               min="18"
//               max="100"
//               className="w-20 px-2 py-1 border rounded"
//             />
//             <span>years</span>
//           </div>
//         </div>
        
//         {/* Height Range Filter */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Height Range (cm)</label>
//           <div className="flex items-center space-x-2">
//             <input
//               type="number"
//               value={heightMin}
//               onChange={(e) => setHeightMin(e.target.value)}
//               min="100"
//               max="250"
//               className="w-20 px-2 py-1 border rounded"
//             />
//             <span>to</span>
//             <input
//               type="number"
//               value={heightMax}
//               onChange={(e) => setHeightMax(e.target.value)}
//               min="100"
//               max="250"
//               className="w-20 px-2 py-1 border rounded"
//             />
//             <span>cm</span>
//           </div>
//         </div>
        
//         Districts Filter
//         <div>
//           <label className="block text-sm font-medium mb-1">Districts</label>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//             {DISTRICTS.map((district) => (
//               <label key={district} className="inline-flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={selectedDistricts.includes(district)}
//                   onChange={() => toggleDistrict(district)}
//                   className="mr-2"
//                 />
//                 {district}
//               </label>
//             ))}
//           </div>
//         </div>
        
//         {/* Action Buttons */}
//         <div className="flex space-x-4 pt-2">
//           <button
//             onClick={applyFilters}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Apply Filters
//           </button>
//           <button
//             onClick={resetFilters}
//             className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
//           >
//             Reset
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// // // app/profiles/ProfileFilter.tsx
// // 'use client';

// // import { useState, useEffect } from 'react';
// // import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// // // Define districts available in your application
// // // You should adjust this list to match your actual districts in the database
// // const DISTRICTS = [
// //   'Central District', 'Eastern District', 'Western District', 
// //   'Southern District', 'Northern District', 'Northwestern District',
// //   'Kurunegala', 'Southwestern District', 'Southeastern District'
// // ];

// // export default function ProfileFilter() {
// //   const router = useRouter();
// //   const pathname = usePathname();
// //   const searchParams = useSearchParams();
  
// //   // Initialize state from URL params
// //   const [gender, setGender] = useState(searchParams.get('gender') || '');
// //   const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '18');
// //   const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '70');
// //   const [heightMin, setHeightMin] = useState(searchParams.get('heightMin') || '150');
// //   const [heightMax, setHeightMax] = useState(searchParams.get('heightMax') || '200');
// //   const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
// //     searchParams.getAll('districts') || []
// //   );

// //   // Update local state when URL parameters change
// //   useEffect(() => {
// //     setGender(searchParams.get('gender') || '');
// //     setAgeMin(searchParams.get('ageMin') || '18');
// //     setAgeMax(searchParams.get('ageMax') || '70');
// //     setHeightMin(searchParams.get('heightMin') || '150');
// //     setHeightMax(searchParams.get('heightMax') || '200');
// //     setSelectedDistricts(searchParams.getAll('districts') || []);
// //   }, [searchParams]);

// //   // Handle district selection toggle
// //   const toggleDistrict = (district: string) => {
// //     setSelectedDistricts(prev => 
// //       prev.includes(district) 
// //         ? prev.filter(d => d !== district) 
// //         : [...prev, district]
// //     );
// //   };

// //   // Apply filters
// //   const applyFilters = () => {
// //     // Create a new URLSearchParams object
// //     const params = new URLSearchParams();
    
// //     // Add current page number if it exists
// //     params.set('page', '1'); // Reset to page 1 when applying filters
    
// //     // Add current perPage if it exists
// //     const perPage = searchParams.get('perPage');
// //     if (perPage) params.set('perPage', perPage);
    
// //     // Add filter values (only if they're not empty)
// //     if (gender) params.set('gender', gender);
// //     if (ageMin && ageMin !== '18') params.set('ageMin', ageMin);
// //     if (ageMax && ageMax !== '70') params.set('ageMax', ageMax);
// //     if (heightMin && heightMin !== '150') params.set('heightMin', heightMin);
// //     if (heightMax && heightMax !== '200') params.set('heightMax', heightMax);
    
// //     // Add multiple districts
// //     selectedDistricts.forEach(district => {
// //       params.append('districts', district);
// //     });

// //     // Navigate to the same path with updated query params
// //     router.push(`${pathname}?${params.toString()}`);
// //   };

// //   // Reset filters
// //   const resetFilters = () => {
// //     setGender('');
// //     setAgeMin('18');
// //     setAgeMax('70');
// //     setHeightMin('150');
// //     setHeightMax('200');
// //     setSelectedDistricts([]);
    
// //     // Navigate to page without filters but keep pagination settings
// //     const params = new URLSearchParams();
// //     const perPage = searchParams.get('perPage');
// //     if (perPage) params.set('perPage', perPage);
// //     params.set('page', '1'); // Reset to page 1
    
// //     router.push(`${pathname}?${params.toString()}`);
// //   };

// //   return (
// //     <div className="bg-white p-4 rounded-lg shadow mb-6">
// //       <h2 className="text-lg font-semibold mb-4">Filter Profiles</h2>
      
// //       <div className="space-y-4">
// //         {/* Gender Filter */}
// //         <div>
// //           <label className="block text-sm font-medium mb-1">Gender</label>
// //           <div className="flex space-x-4">
// //             <label className="inline-flex items-center">
// //               <input
// //                 type="radio"
// //                 name="gender"
// //                 value="MALE"
// //                 checked={gender === 'MALE'}
// //                 onChange={(e) => setGender(e.target.value)}
// //                 className="mr-2"
// //               />
// //               Male
// //             </label>
// //             <label className="inline-flex items-center">
// //               <input
// //                 type="radio"
// //                 name="gender"
// //                 value="FEMALE"
// //                 checked={gender === 'FEMALE'}
// //                 onChange={(e) => setGender(e.target.value)}
// //                 className="mr-2"
// //               />
// //               Female
// //             </label>
// //             <label className="inline-flex items-center">
// //               <input
// //                 type="radio"
// //                 name="gender"
// //                 value=""
// //                 checked={gender === ''}
// //                 onChange={() => setGender('')}
// //                 className="mr-2"
// //               />
// //               Any
// //             </label>
// //           </div>
// //         </div>
        
// //         {/* Age Range Filter */}
// //         <div>
// //           <label className="block text-sm font-medium mb-1">Age Range</label>
// //           <div className="flex items-center space-x-2">
// //             <input
// //               type="number"
// //               value={ageMin}
// //               onChange={(e) => setAgeMin(e.target.value)}
// //               min="18"
// //               max="100"
// //               className="w-20 px-2 py-1 border rounded"
// //             />
// //             <span>to</span>
// //             <input
// //               type="number"
// //               value={ageMax}
// //               onChange={(e) => setAgeMax(e.target.value)}
// //               min="18"
// //               max="100"
// //               className="w-20 px-2 py-1 border rounded"
// //             />
// //             <span>years</span>
// //           </div>
// //         </div>
        
// //         {/* Height Range Filter */}
// //         <div>
// //           <label className="block text-sm font-medium mb-1">Height Range (cm)</label>
// //           <div className="flex items-center space-x-2">
// //             <input
// //               type="number"
// //               value={heightMin}
// //               onChange={(e) => setHeightMin(e.target.value)}
// //               min="100"
// //               max="250"
// //               className="w-20 px-2 py-1 border rounded"
// //             />
// //             <span>to</span>
// //             <input
// //               type="number"
// //               value={heightMax}
// //               onChange={(e) => setHeightMax(e.target.value)}
// //               min="100"
// //               max="250"
// //               className="w-20 px-2 py-1 border rounded"
// //             />
// //             <span>cm</span>
// //           </div>
// //         </div>
        
// //         {/* Districts Filter */}
// //         <div>
// //           <label className="block text-sm font-medium mb-1">Districts</label>
// //           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
// //             {DISTRICTS.map((district) => (
// //               <label key={district} className="inline-flex items-center">
// //                 <input
// //                   type="checkbox"
// //                   checked={selectedDistricts.includes(district)}
// //                   onChange={() => toggleDistrict(district)}
// //                   className="mr-2"
// //                 />
// //                 {district}
// //               </label>
// //             ))}
// //           </div>
// //         </div>
        
// //         {/* Action Buttons */}
// //         <div className="flex space-x-4 pt-2">
// //           <button
// //             onClick={applyFilters}
// //             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
// //           >
// //             Apply Filters
// //           </button>
// //           <button
// //             onClick={resetFilters}
// //             className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
// //           >
// //             Reset
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }



// // // app/profiles/ProfileFilter.tsx
// // 'use client';

// // import { useState, useEffect } from 'react';
// // import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// // // Define districts available in your application
// // const DISTRICTS = [
// //   'Central District', 'Eastern District', 'Western District', 
// //   'Southern District', 'Northern District', 'Northwestern District',
// //   'Northeastern District', 'Southwestern District', 'Southeastern District'
// // ];

// // export default function ProfileFilter() {
// //   const router = useRouter();
// //   const pathname = usePathname();
// //   const searchParams = useSearchParams();
  
// //   // Initialize state from URL params
// //   const [gender, setGender] = useState(searchParams.get('gender') || '');
// //   const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '18');
// //   const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '70');
// //   const [heightMin, setHeightMin] = useState(searchParams.get('heightMin') || '150');
// //   const [heightMax, setHeightMax] = useState(searchParams.get('heightMax') || '200');
// //   const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
// //     searchParams.getAll('districts') || []
// //   );

// //   // Handle district selection toggle
// //   const toggleDistrict = (district: string) => {
// //     setSelectedDistricts(prev => 
// //       prev.includes(district) 
// //         ? prev.filter(d => d !== district) 
// //         : [...prev, district]
// //     );
// //   };

// //   // Apply filters
// //   const applyFilters = () => {
// //     // Create a new URLSearchParams object
// //     const params = new URLSearchParams();
    
// //     // Add current page number if it exists
// //     const currentPage = searchParams.get('page');
// //     if (currentPage) params.set('page', currentPage);
    
// //     // Add current perPage if it exists
// //     const perPage = searchParams.get('perPage');
// //     if (perPage) params.set('perPage', perPage);
    
// //     // Add filter values
// //     if (gender) params.set('gender', gender);
// //     if (ageMin) params.set('ageMin', ageMin);
// //     if (ageMax) params.set('ageMax', ageMax);
// //     if (heightMin) params.set('heightMin', heightMin);
// //     if (heightMax) params.set('heightMax', heightMax);
    
// //     // Add multiple districts
// //     selectedDistricts.forEach(district => {
// //       params.append('districts', district);
// //     });

// //     // Navigate to the same path with updated query params
// //     router.push(`${pathname}?${params.toString()}`);
// //   };

// //   // Reset filters
// //   const resetFilters = () => {
// //     setGender('');
// //     setAgeMin('18');
// //     setAgeMax('70');
// //     setHeightMin('150');
// //     setHeightMax('200');
// //     setSelectedDistricts([]);
    
// //     // Keep pagination params if they exist
// //     const params = new URLSearchParams();
// //     const currentPage = searchParams.get('page');
// //     if (currentPage) params.set('page', currentPage);
// //     const perPage = searchParams.get('perPage');
// //     if (perPage) params.set('perPage', perPage);
    
// //     router.push(`${pathname}?${params.toString()}`);
// //   };

// //   return (
// //     <div className="bg-white p-4 rounded-lg shadow mb-6">
// //       <h2 className="text-lg font-semibold mb-4">Filter Profiles</h2>
      
// //       <div className="space-y-4">
// //         {/* Gender Filter */}
// //         <div>
// //           <label className="block text-sm font-medium mb-1">Gender</label>
// //           <div className="flex space-x-4">
// //             <label className="inline-flex items-center">
// //               <input
// //                 type="radio"
// //                 name="gender"
// //                 value="MALE"
// //                 checked={gender === 'MALE'}
// //                 onChange={(e) => setGender(e.target.value)}
// //                 className="mr-2"
// //               />
// //               Male
// //             </label>
// //             <label className="inline-flex items-center">
// //               <input
// //                 type="radio"
// //                 name="gender"
// //                 value="FEMALE"
// //                 checked={gender === 'FEMALE'}
// //                 onChange={(e) => setGender(e.target.value)}
// //                 className="mr-2"
// //               />
// //               Female
// //             </label>
// //             <label className="inline-flex items-center">
// //               <input
// //                 type="radio"
// //                 name="gender"
// //                 value=""
// //                 checked={gender === ''}
// //                 onChange={(e) => setGender('')}
// //                 className="mr-2"
// //               />
// //               Any
// //             </label>
// //           </div>
// //         </div>
        
// //         {/* Age Range Filter */}
// //         <div>
// //           <label className="block text-sm font-medium mb-1">Age Range</label>
// //           <div className="flex items-center space-x-2">
// //             <input
// //               type="number"
// //               value={ageMin}
// //               onChange={(e) => setAgeMin(e.target.value)}
// //               min="18"
// //               max="100"
// //               className="w-20 px-2 py-1 border rounded"
// //             />
// //             <span>to</span>
// //             <input
// //               type="number"
// //               value={ageMax}
// //               onChange={(e) => setAgeMax(e.target.value)}
// //               min="18"
// //               max="100"
// //               className="w-20 px-2 py-1 border rounded"
// //             />
// //             <span>years</span>
// //           </div>
// //         </div>
        
// //         {/* Height Range Filter */}
// //         <div>
// //           <label className="block text-sm font-medium mb-1">Height Range (cm)</label>
// //           <div className="flex items-center space-x-2">
// //             <input
// //               type="number"
// //               value={heightMin}
// //               onChange={(e) => setHeightMin(e.target.value)}
// //               min="100"
// //               max="250"
// //               className="w-20 px-2 py-1 border rounded"
// //             />
// //             <span>to</span>
// //             <input
// //               type="number"
// //               value={heightMax}
// //               onChange={(e) => setHeightMax(e.target.value)}
// //               min="100"
// //               max="250"
// //               className="w-20 px-2 py-1 border rounded"
// //             />
// //             <span>cm</span>
// //           </div>
// //         </div>
        
// //         {/* Districts Filter */}
// //         <div>
// //           <label className="block text-sm font-medium mb-1">Districts</label>
// //           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
// //             {DISTRICTS.map((district) => (
// //               <label key={district} className="inline-flex items-center">
// //                 <input
// //                   type="checkbox"
// //                   checked={selectedDistricts.includes(district)}
// //                   onChange={() => toggleDistrict(district)}
// //                   className="mr-2"
// //                 />
// //                 {district}
// //               </label>
// //             ))}
// //           </div>
// //         </div>
        
// //         {/* Action Buttons */}
// //         <div className="flex space-x-4 pt-2">
// //           <button
// //             onClick={applyFilters}
// //             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
// //           >
// //             Apply Filters
// //           </button>
// //           <button
// //             onClick={resetFilters}
// //             className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
// //           >
// //             Reset
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }