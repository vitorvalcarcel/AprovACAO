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
        var materiaPai = materiaRepository.findById(dados.materiaId())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        if (!materiaPai.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Você não pode adicionar tópicos na matéria de outro usuário!");
        }

        var topico = new Topico();
        topico.setNome(dados.nome());
        topico.setMateria(materiaPai);

        repository.save(topico);
        return new DadosListagemTopico(topico);
    }

    public List<DadosListagemTopico> listar(Long materiaId, Usuario usuario) {
        var materiaPai = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        if (!materiaPai.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado à esta matéria.");
        }

        return repository.findAllByMateriaIdAndArquivadoFalse(materiaId)
                .stream()
                .map(DadosListagemTopico::new)
                .toList();
    }

    public DadosListagemTopico atualizar(DadosAtualizacaoTopico dados, Usuario usuario) {
        var topico = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Tópico não encontrado"));

        validarDono(topico, usuario);

        topico.atualizarInformacoes(dados.nome());
        return new DadosListagemTopico(repository.save(topico));
    }

    public void excluir(Long id, Usuario usuario) {
        var topico = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tópico não encontrado"));

        validarDono(topico, usuario);

        if (registroRepository.existsByTopicoId(id)) {
            throw new RuntimeException("Não é possível excluir: Já existem estudos registrados para este tópico.");
        }

        repository.delete(topico);
    }

    public void arquivar(Long id, Usuario usuario) {
        var topico = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tópico não encontrado"));
        validarDono(topico, usuario);
        topico.setArquivado(true);
        repository.save(topico);
    }

    public void desarquivar(Long id, Usuario usuario) {
        var topico = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tópico não encontrado"));
        validarDono(topico, usuario);
        topico.setArquivado(false);
        repository.save(topico);
    }

    private void validarDono(Topico topico, Usuario usuario) {
        if (!topico.getMateria().getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado!");
        }
    }
}