import { Link } from "react-router-dom";
import { Gamepad2, Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-cyan">
                <Gamepad2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-gradient-neon">
                SKILLZONE
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              A plataforma definitiva para jogos competitivos baseados em habilidade.
              Compete, ganhe prêmios e torne-se uma lenda.
            </p>
          </div>

          {/* Jogos */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
              Jogos
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/games/chess" className="hover:text-primary transition-colors">Xadrez</Link></li>
              <li><Link to="/games/checkers" className="hover:text-primary transition-colors">Damas</Link></li>
              <li><Link to="/games/go" className="hover:text-primary transition-colors">Go</Link></li>
              <li><Link to="/games/sudoku" className="hover:text-primary transition-colors">Sudoku</Link></li>
              <li><Link to="/games/quiz" className="hover:text-primary transition-colors">Quiz</Link></li>
            </ul>
          </div>

          {/* Plataforma */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/tournaments" className="hover:text-primary transition-colors">Torneios</Link></li>
              <li><Link to="/rankings" className="hover:text-primary transition-colors">Rankings</Link></li>
              <li><Link to="/hall-of-fame" className="hover:text-primary transition-colors">Hall da Fama</Link></li>
              <li><Link to="/affiliates" className="hover:text-primary transition-colors">Afiliados</Link></li>
              <li><Link to="/records" className="hover:text-primary transition-colors">Recordes</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/responsible-gaming" className="hover:text-primary transition-colors">Jogo Responsável</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Suporte</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 SkillZone. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
