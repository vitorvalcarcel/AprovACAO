package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosAtualizacaoMateria;
import com.nomeacao.api.dto.DadosCadastroMateria;
import com.nomeacao.api.dto.DadosListagemMateria;
import com.nomeacao.api.model.Materia;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.ConcursoMateriaRepository;
import com.nomeacao.api.repository.MateriaRepository;
import com.nomeacao.api.repository.RegistroEstudoRepository;
import com.nomeacao.api.repository.CicloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository repository;

    @Autowired
    private RegistroEstudoRepository registroRepository;

    @Autowired
    private ConcursoMateriaRepository vinculoRepository;

    @Autowired 
    private CicloRepository cicloRepository;

    public DadosListagemMateria cadastrar(DadosCadastroMateria dados, Usuario usuario) {
        var materia = new Materia();
        materia.setNome(dados.nome());
        materia.setUsuario(usuario);
        
        repository.save(materia);
        
        return new DadosListagemMateria(materia);
    }

    public List<DadosListagemMateria> listar(Usuario usuario) {
        return repository.findAllByUsuario(usuario)
                .stream()
                .map(DadosListagemMateria::new)
                .toList();
    }

    public DadosListagemMateria atualizar(DadosAtualizacaoMateria dados, Usuario usuario) {
        var materia = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        validarDono(materia, usuario);

        materia.atualizarInformacoes(dados.nome());
        return new DadosListagemMateria(repository.save(materia)); 
    }

    public void excluir(Long id, Usuario usuario) {
        var materia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        validarDono(materia, usuario);

        if (registroRepository.existsByMateriaId(id)) {
            throw new RuntimeException("Não é possível excluir: Há registros de estudo para esta matéria.");
        }

        if (vinculoRepository.existsByMateriaId(id)) {
            throw new RuntimeException("Não é possível excluir: Esta matéria está vinculada a um concurso.");
        }

        repository.delete(materia);
    }

    private void validarDono(Materia materia, Usuario usuario) {
        if (!materia.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado: Essa matéria não é sua!");
        }
    }

    public void arquivar(Long id, Usuario usuario) {
        var materia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        if (!materia.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado: Essa matéria não é sua!");
        }
        if (cicloRepository.isMateriaEmCicloAtivo(id)) {
            throw new RuntimeException("Não é possível arquivar: Esta matéria faz parte de um Ciclo de Estudos ativo. Finalize o ciclo antes.");
        }

        materia.setArquivada(true);
        repository.save(materia);
    }
    
    public void desarquivar(Long id, Usuario usuario) {
        var materia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
                
        if (!materia.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado!");
        }

        materia.setArquivada(false);
        repository.save(materia);
    }
}