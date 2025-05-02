#!/bin/bash

# Create directories for property images
mkdir -p /Users/judytsao/Desktop/Real\ Estate/images/properties

# Download property images from Unsplash
# Property 1
curl -o "/Users/judytsao/Desktop/Real Estate/images/property1.jpg" https://images.unsplash.com/photo-1600596542815-ffad4c1539a9
curl -o "/Users/judytsao/Desktop/Real Estate/images/property1-2.jpg" https://images.unsplash.com/photo-1600607687939-ce8a6c25118c
curl -o "/Users/judytsao/Desktop/Real Estate/images/property1-3.jpg" https://images.unsplash.com/photo-1600566753376-12c8ab8e17a9

# Property 2
curl -o "/Users/judytsao/Desktop/Real Estate/images/property2.jpg" https://images.unsplash.com/photo-1600585154340-be6161a56a0c
curl -o "/Users/judytsao/Desktop/Real Estate/images/property2-2.jpg" https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea
curl -o "/Users/judytsao/Desktop/Real Estate/images/property2-3.jpg" https://images.unsplash.com/photo-1600210492493-0946911123ea

# Property 3
curl -o "/Users/judytsao/Desktop/Real Estate/images/property3.jpg" https://images.unsplash.com/photo-1580587771525-78b9dba3b914
curl -o "/Users/judytsao/Desktop/Real Estate/images/property3-2.jpg" https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83
curl -o "/Users/judytsao/Desktop/Real Estate/images/property3-3.jpg" https://images.unsplash.com/photo-1560448204-e02f11c3d0e2

# Property 4
curl -o "/Users/judytsao/Desktop/Real Estate/images/property4.jpg" https://images.unsplash.com/photo-1564013799919-ab600027ffc6
curl -o "/Users/judytsao/Desktop/Real Estate/images/property4-2.jpg" https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde
curl -o "/Users/judytsao/Desktop/Real Estate/images/property4-3.jpg" https://images.unsplash.com/photo-1600566753104-685f4f24cb4d

# Property 5
curl -o "/Users/judytsao/Desktop/Real Estate/images/property5.jpg" https://images.unsplash.com/photo-1600607687920-4e2a09cf159d
curl -o "/Users/judytsao/Desktop/Real Estate/images/property5-2.jpg" https://images.unsplash.com/photo-1600607687644-c7f34c43d2fd
curl -o "/Users/judytsao/Desktop/Real Estate/images/property5-3.jpg" https://images.unsplash.com/photo-1600607687370-8c2530fc1b14

# Property 6
curl -o "/Users/judytsao/Desktop/Real Estate/images/property6.jpg" https://images.unsplash.com/photo-1600585154526-990dced4db3d
curl -o "/Users/judytsao/Desktop/Real Estate/images/property6-2.jpg" https://images.unsplash.com/photo-1600585154363-67eb9e2e2099
curl -o "/Users/judytsao/Desktop/Real Estate/images/property6-3.jpg" https://images.unsplash.com/photo-1600047508788-26bb7b45223b

# Create a placeholder image for properties without images
curl -o "/Users/judytsao/Desktop/Real Estate/images/property-placeholder.jpg" https://images.unsplash.com/photo-1582407947304-fd86f028f716

echo "All property images have been downloaded."
