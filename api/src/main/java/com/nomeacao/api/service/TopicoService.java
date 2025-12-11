package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosAtualizacaoTopico;
import com.nomeacao.api.dto.DadosCadastroTopico;
import com.nomeacao.api.dto.DadosListagemTopico;
import com.nomeacao.api.model.Topico;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.MateriaRepository;
import com.nomeacao.api.repository.RegistroEstudoRepository;
import com.nomeacao.api.repository.TopicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TopicoService {

    @Autowired
    private TopicoRepository repository;

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private RegistroEstudoRepository registroRepository;

    public DadosListagemTopico cadastrar(DadosCadastroTopico dados, Usuario usuario) {
        var materia = materiaRepository.findById(dados.materiaId())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        if (!materia.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Você não tem permissão para adicionar tópicos nesta matéria.");
        }

        var topico = new Topico();
        topico.setNome(dados.nome());
        topico.setMateria(materia);
        topico.setArquivado(false);

        repository.save(topico);
        return new DadosListagemTopico(topico);
    }

    public List<DadosListagemTopico> listar(Long materiaId, boolean incluirArquivados, Usuario usuario) {
        var materia = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        if (!materia.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado a esta matéria.");
        }

        List<Topico> lista;
        if (incluirArquivados) {
            lista = repository.findAllByMateriaId(materiaId);
        } else {
            lista = repository.findAllByMateriaIdAndArquivadoFalse(materiaId);
        }

        return lista.stream().map(DadosListagemTopico::new).toList();
    }

    public DadosListagemTopico atualizar(DadosAtualizacaoTopico dados, Usuario usuario) {
        var topico = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Tópico não encontrado"));

        if (!topico.getMateria().getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado.");
        }

        topico.setNome(dados.nome());
        return new DadosListagemTopico(topico);
    }

    public void excluir(Long id, Usuario usuario) {
        var topico = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tópico não encontrado"));

        if (!topico.getMateria().getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado.");
        }
        
        if (registroRepository.existsByTopicoId(id)) {
            throw new RuntimeException("Não é possível excluir este tópico pois existem estudos vinculados a ele. Tente arquivá-lo.");
        }
        
        repository.delete(topico);
    }

    public void arquivar(Long id, Usuario usuario) {
        var topico = repository.findById(id).orElseThrow();
        if (!topico.getMateria().getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");
        
        topico.setArquivado(true);
    }

    public void desarquivar(Long id, Usuario usuario) {
        var topico = repository.findById(id).orElseThrow();
        if (!topico.getMateria().getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");
        
        topico.setArquivado(false);
    }
}