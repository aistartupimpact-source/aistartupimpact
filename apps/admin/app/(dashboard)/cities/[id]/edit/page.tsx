import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@aistartupimpact/database';
import { generateSlug } from '@aistartupimpact/utils';
import CityForm from '../../CityForm';

interface EditCityPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Edit City | Admin',
};

export default async function EditCityPage({ params }: EditCityPageProps) {
  const city = await prisma.indiaAICity.findUnique({
    where: { id: params.id }
  });

  if (!city) {
    notFound();
  }

  // Convert decimal properties to number for client compatibility
  const normalizedCity = {
    cityName: city.cityName,
    state: city.state,
    latitude: city.latitude ? Number(city.latitude) : null,
    longitude: city.longitude ? Number(city.longitude) : null,
    isActive: city.isActive || false,
    aliases: city.aliases || [],
  };

  async function updateCity(formData: FormData) {
    'use server';

    const cityName = formData.get('cityName') as string;
    if (!cityName) throw new Error('City Name is required');

    const slug = generateSlug(cityName);
    const state = formData.get('state') as string || null;
    
    // Parse coordinates if provided
    const latInput = formData.get('latitude');
    const lngInput = formData.get('longitude');
    const latitude = latInput ? Number(latInput) : 0;
    const longitude = lngInput ? Number(lngInput) : 0;

    const isActive = formData.get('isActive') === 'on';

    const aliases = (formData.get('aliases') as string)
      ?.split(',')
      ?.map(a => a.trim())
      ?.filter(Boolean) || [];

    await prisma.indiaAICity.update({
      where: { id: params.id },
      data: {
        cityName,
        slug,
        state,
        latitude,
        longitude,
        isActive,
        source: 'standard',
        aliases,
      },
    });

    // Also sync to City table when active
    if (isActive) {
      const existingCity = await prisma.$queryRaw<any[]>`
        SELECT id FROM "City"
        WHERE LOWER(name) = LOWER(${cityName})
          OR slug = ${slug}
        LIMIT 1
      `;

      if (existingCity.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO "City" (id, slug, name, state, country, latitude, longitude, aliases, "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid(),
            ${slug},
            ${cityName},
            ${state},
            'India',
            ${latitude},
            ${longitude},
            ${aliases},
            NOW(),
            NOW()
          )
          ON CONFLICT (slug) DO NOTHING
        `;
      } else {
        // Update existing City table entry
        await prisma.$executeRaw`
          UPDATE "City"
          SET name = ${cityName}, state = ${state}, aliases = ${aliases}, "updatedAt" = NOW()
          WHERE LOWER(name) = LOWER(${cityName}) OR slug = ${slug}
        `;
      }
    }

    redirect('/cities');
  }

  return (
    <div className="p-6">
      <div className="mb-6 font-jakarta">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-sora">
          Edit City: {city.cityName}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-jakarta">
          Update custom city name, state, active status, or coordinates.
        </p>
      </div>

      <CityForm action={updateCity} initialData={normalizedCity} />
    </div>
  );
}
