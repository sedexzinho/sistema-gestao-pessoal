package org.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.example.models.User;


@Repository
public interface UsersRepository extends JpaRepository<User, Long>{

      Optional<User> findByEmail(String email);

}
