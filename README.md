# Aperture & defocus

Interactive, dependency-free geometric-optics teaching demo. Open index.html directly or serve this folder. Select an asymmetric aperture, move the observation plane through focus, rotate the aperture, or animate a sweep. Source options: point, finite circle, square, F, and Hello Kitty face. Extended-source images sum uniformly sampled incoherent geometric rays using r(t)=(1-t)a-t u, with adjustable source size and thin-lens image magnification, and a one-pixel reconstruction. Brightness is normalized per frame.

For an on-axis ideal image at z_i and aperture/exit pupil at z=0, transverse ray coordinates obey r(z) = (1-z/z_i) r_aperture. The sign change produces a 180-degree rotation. Both transverse panels use identical fixed axes. Intensity, diffraction and aberrations are not simulated; the focus dot is only a visible marker.

GitHub Pages: deploy from main, /(root). No dependencies or build needed.

Source size is adjustable from 0.10 to 1.20 aperture-coordinate units (disabled for an ideal point). Observation position and animation cover z/z_i=0 to 2. The ray plot includes the source at -d_o, thin lens at 0 and image at +d_i; the default is a 2f-to-2f imaging system. Transverse views use a fixed field of view across sizes and distances.

Object distance is adjustable from 2f to 5f. Image distance d_i/f=d_o/(d_o-f), magnification m=-f/(d_o-f). The source term in each ray and image is scaled by the corresponding magnification; z/z_i remains 0 to 2.
