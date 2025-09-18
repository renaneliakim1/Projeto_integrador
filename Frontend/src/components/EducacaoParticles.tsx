import { Particles } from "@tsparticles/react";

const EducacaoParticles = () => {
  // Animação básica sem hooks extras
  return (
    <Particles
      id="educacao-bg"
      options={{
        background: {
          color: {
            value: "#f3f4f6"
          }
        },
        fpsLimit: 60,
        particles: {
          number: {
            value: 30,
            density: { enable: true, area: 800 }
          },
          shape: {
            type: "circle"
          },
          size: {
            value: 24,
            random: { enable: true, minimumValue: 16 }
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            outModes: { default: "out" }
          },
          opacity: {
            value: 0.7,
            random: { enable: true, minimumValue: 0.4 }
          }
        },
        detectRetina: true
      }}
    />
  );
};

export default EducacaoParticles;
