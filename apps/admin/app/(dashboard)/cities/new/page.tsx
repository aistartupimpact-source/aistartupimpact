import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@aistartupimpact/database';
import { generateSlug } from '@aistartupimpact/utils';
import CityForm from '../CityForm';

export const metadata: Metadata = {
  title: 'Add City | Admin',
};

export default function NewCityPage() {
  async function createCity(formData: FormData) {
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

    // Create in IndiaAICity table (for dropdown display)
    await prisma.indiaAICity.create({
      data: {
        cityName,
        slug,
        state,
        latitude,
        longitude,
        isActive,
        source: 'standard',
        aliases,
        // Default other fields to safe empty values
        totalStartups: 0,
        totalFunding: BigInt(0),
        topSectors: [],
        keyAccelerators: [],
        notableCompanies: [],
        description: null,
        isFeatured: false,
        displayOrder: 99,
      },
    });

    // Also sync to City table (for cityId resolution in startups)
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
      }
    }

    redirect('/cities');
  }

  return (
    <div className="p-6">
      <div className="mb-6 font-jakarta">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-sora">
          Add Custom City
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Register a standard city name and state to make it selectable across forms.
        </p>
      </div>

      <CityForm action={createCity} />
    </div>
  );
}
