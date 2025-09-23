import founders from "@/assets/founders.png";
const EditorialSection = () => {
  return <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-normal text-foreground leading-tight">
            Jewelry Drawn From Shadows and Lines
          </h2>
          <p className="text-sm font-light text-foreground leading-relaxed">Linea was born from the meeting of two minds who saw beauty not just in ornament, but in structure. With backgrounds spanning architecture and fine arts, the founders believed that jewelry could be more than decoration — it could be an extension of space, light, and line.

        </p>
          <a href="#" className="inline-block text-sm font-normal text-foreground underline underline-offset-4 hover:no-underline transition-all duration-200">
            Read more
          </a>
        </div>
        
        <div className="order-first md:order-last">
          <div className="w-full aspect-square overflow-hidden">
            <img src={founders} alt="Linea founders - two women in minimalist jewelry" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>;
};
export default EditorialSection;