"use client";
import { PrismaClient, Course } from '@/generated/prisma';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image'; // Importar el componente Image

interface HeroCarouselProps {
  courses: Course[];
}

const HeroCarousel = ({ courses }: HeroCarouselProps) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 10000 }}
      loop={true}
    >
      {courses.map((course) => (
        <SwiperSlide key={course.id}>
          <div className="relative bg-gray-900">
            <div className="absolute inset-0">
              <Image
                className="w-full h-[600px] object-cover"
                src={course.imagen_portada || '/images/placeholder-course.jpg'}
                alt={course.titulo}
                width={1200} // Ancho de placeholder
                height={600} // Altura de placeholder
              />
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <div className="relative container mx-auto px-4 py-24 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-playfair-display">
                {course.titulo}
              </h1>
              <p className="mt-3 max-w-md mx-auto text-lg text-gray-300 sm:text-xl md:mt-5 md:max-w-3xl font-inter">
                {course.descripcion_corta}
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 font-inter"
                  >
                    Ver curso
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousel;